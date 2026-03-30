import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Define the Node environment to read basic project status.
const server = new Server(
  {
    name: "jws-project-map-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

// -----------------------------------------
// RESOURCES
// -----------------------------------------
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "file:///README.md",
        name: "Project README",
        mimeType: "text/markdown",
        description: "The main README of the jws-project-map project.",
      },
      {
        uri: "file:///package.json",
        name: "Project package.json",
        mimeType: "application/json",
        description: "The package.json outlining dependencies and scripts.",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "file:///README.md") {
    const readmeContent = await fs.readFile(
      path.join(PROJECT_ROOT, "README.md"),
      "utf-8"
    );
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "text/markdown",
          text: readmeContent,
        },
      ],
    };
  }
  
  if (request.params.uri === "file:///package.json") {
    const pkgContent = await fs.readFile(
      path.join(PROJECT_ROOT, "package.json"),
      "utf-8"
    );
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: pkgContent,
        },
      ],
    };
  }

  throw new Error(`Resource not found: ${request.params.uri}`);
});

// -----------------------------------------
// TOOLS
// -----------------------------------------
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_project_structure",
        description: "Returns the top-level directory structure of the project.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "read_env_keys",
        description: "Returns the existing keys in the environment file (without values for security) to verify configurations.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "nocodb_query",
        description: "Queries the NocoDB API for records of a specific table ID. You can find table IDs in the src/services codebase.",
        inputSchema: {
          type: "object",
          properties: {
            tableId: { type: "string", description: "The NocoDB Table ID (e.g. m4wto2nnf9c230g)." },
            limit: { type: "number", description: "Max records to return." }
          },
          required: ["tableId"],
        },
      },
      {
        name: "vue_list_components",
        description: "Returns a list of all Vue components in the src/components folder.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "vue_generate_component_skeleton",
        description: "Provides a standard Skeleton for a new Vue 3 Component adhering to the project's requirements (Composition API, Bootstrap, TypeScript).",
        inputSchema: {
          type: "object",
          properties: {
            componentName: { type: "string" }
          },
          required: ["componentName"],
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_project_structure") {
    try {
      const files = await fs.readdir(PROJECT_ROOT);
      return {
        content: [{ type: "text", text: JSON.stringify(files, null, 2) }],
      };
    } catch (e: unknown) {
      const error = e as Error;
      return { content: [{ type: "text", text: `Error reading structure: ${error.message}` }], isError: true };
    }
  }

  if (request.params.name === "read_env_keys") {
    try {
      const envContent = await fs.readFile(path.join(PROJECT_ROOT, ".env.local"), "utf-8");
      
      const keys = envContent
        .split("\\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => line.split("=")[0]);

      return {
        content: [{ type: "text", text: `Available Environment Variables: \\n${keys.join("\\n")}` }],
      };
    } catch (e: unknown) {
      const error = e as Error;
      return { content: [{ type: "text", text: `.env.local file not easily readable or does not exist: ${error.message}` }], isError: true };
    }
  }

  if (request.params.name === "nocodb_query") {
    const tableId = String(request.params.arguments?.tableId);
    const limit = Number(request.params.arguments?.limit) || 10;
    
    // Fall back to Vite prefixes if not directly exposed
    const baseUrl = process.env.VITE_APP_NOCODB_URL || process.env.NOCODB_URL;
    const token = process.env.VITE_APP_NOCODB_TOKEN || process.env.NOCODB_TOKEN;

    if (!baseUrl || !token) {
      return {
        content: [{ type: "text", text: "Error: NocoDB URL or Token are missing from environment variables." }],
        isError: true,
      };
    }

    try {
      const apiUrl = `${baseUrl}/api/v2/tables/${tableId}/records?limit=${limit}`;
      const res = await fetch(apiUrl, {
        headers: {
          "xc-token": token,
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) {
        throw new Error(`NocoDB API error: ${res.status} - ${res.statusText}`);
      }
      const data = await res.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (e: unknown) {
      const error = e as Error;
      return {
        content: [{ type: "text", text: `Failed to query NocoDB: ${error.message}` }],
        isError: true,
      };
    }
  }

  if (request.params.name === "vue_list_components") {
    try {
      const compPath = path.join(PROJECT_ROOT, "src", "components");
      // Read recursively (basic depth string representation)
      const readDirRecursiveString = async (dir: string, p = ""): Promise<string[]> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(entries.map(async (entry) => {
          const res = path.resolve(dir, entry.name);
          const relPath = path.join(p, entry.name);
          return entry.isDirectory() ? await readDirRecursiveString(res, relPath) : relPath;
        }));
        return Array.prototype.concat(...files);
      };

      const files = await readDirRecursiveString(compPath);
      const vueFiles = files.filter(f => f.endsWith(".vue"));
      return {
        content: [{ type: "text", text: `Vue Components found:\\n${vueFiles.join("\\n")}` }],
      };
    } catch (e: unknown) {
      const error = e as Error;
      return { content: [{ type: "text", text: `Could not read components: ${error.message}` }], isError: true };
    }
  }

  if (request.params.name === "vue_generate_component_skeleton") {
    const name = String(request.params.arguments?.componentName || "MyComponent");
    const template = `<template>
  <div class="${name.toLowerCase()}-wrapper">
    <!-- Component Content using Bootstrap Vue Next -->
    <BContainer>
      <BRow>
        <BCol>
          <h2>${name}</h2>
          <p>Component content goes here.</p>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Props & Emits
// const props = defineProps<{}>()
// const emit = defineEmits<{}>()

// State
const isReady = ref(false)

// Lifecycle
onMounted(() => {
  isReady.value = true
})
</script>

<style scoped>
.${name.toLowerCase()}-wrapper {
  /* Add scoped styles if necessary */
}
</style>`;

    return {
      content: [{ type: "text", text: template }],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// -----------------------------------------
// PROMPTS
// -----------------------------------------
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "analyze_project",
        description: "A prompt that asks the assistant to analyze the current structure and suggest optimizations.",
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name === "analyze_project") {
    return {
      description: "Analyze the jws-project-map repository.",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Please analyze the `jws-project-map` project by reviewing the README and its structure, and suggest how to better align with the NocoDB integrations.",
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${request.params.name}`);
});

// -----------------------------------------
// INITIALIZATION
// -----------------------------------------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
