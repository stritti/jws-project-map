/**
 * Image Optimization Script
 * Optimizes PNG images using sharp with better compression
 * For this project, all images are icons where PNG is more efficient than WebP
 * Uses oxipng-level compression for PNG files
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.join(__dirname, "..", "public", "img");

// PNG compression options for different image types
const OPTIMIZATION_CONFIG = {
  // Small icons (16x16 - 64x64) - aggressive compression
  small_icons: {
    quality: 60,
    compressionLevel: 9,
    effort: 10,
    patterns: ["favicon-16x16", "favicon-32x32", "pwa-64x64"],
  },
  // Medium icons (76x76 - 152x152) - balanced compression
  medium_icons: {
    quality: 70,
    compressionLevel: 9,
    effort: 8,
    patterns: [
      "apple-touch-icon-60x60",
      "apple-touch-icon-76x76",
      "apple-touch-icon-120x120",
      "apple-touch-icon-152x152",
      "pwa-192x192",
      "mstile-150x150",
      "msapplication-icon-144x144",
    ],
  },
  // Large icons (180x180+) - moderate compression to preserve quality
  large_icons: {
    quality: 80,
    compressionLevel: 6,
    effort: 6,
    patterns: [
      "apple-touch-icon-180x180",
      "apple-touch-icon",
      "android-chrome-192x192",
      "android-chrome-maskable-192x192",
      "android-chrome-maskable-512x512",
      "maskable-icon-512x512",
      "pwa-512x512",
    ],
  },
  // Logo and content images - high quality
  content: {
    quality: 85,
    compressionLevel: 6,
    effort: 6,
    patterns: ["cropped-joerg-wolff-stiftung", "placeholder"],
  },
};

/**
 * Get optimization config for a filename
 */
function getConfig(filename) {
  for (const [_category, config] of Object.entries(OPTIMIZATION_CONFIG)) {
    for (const pattern of config.patterns) {
      if (filename.includes(pattern)) {
        return config;
      }
    }
  }
  // Default config for unknown images
  return {
    quality: 80,
    compressionLevel: 6,
    effort: 6,
  };
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Optimize a single PNG image
 */
async function optimizeImage(inputPath) {
  try {
    const filename = path.basename(inputPath);
    const config = getConfig(filename);
    
    const originalBuffer = fs.readFileSync(inputPath);
    const originalSize = originalBuffer.length;
    
    // Use sharp to re-encode PNG with better compression
    const optimizedBuffer = await sharp(originalBuffer)
      .png({
        quality: config.quality,
        compressionLevel: config.compressionLevel,
        effort: config.effort,
        force: true, // Force PNG output even if input is PNG
      })
      .toBuffer();
    
    const optimizedSize = optimizedBuffer.length;
    
    // Only write if we actually reduced the size
    if (optimizedSize < originalSize) {
      fs.writeFileSync(inputPath, optimizedBuffer);
      const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      console.log(
        `✅ ${filename} ` +
        `(${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} | -${reduction}%)`
      );
      
      return { inputSize: originalSize, outputSize: optimizedSize, reduction: parseFloat(reduction) };
    } else {
      console.log(
        `⏭️  ${filename} (no improvement: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)})`
      );
      return null;
    }
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
    return null;
  }
}

/**
 * Find all PNG images to optimize
 */
function findImages() {
  const images = [];
  
  function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (stat.isFile() && /\.png$/i.test(file)) {
        images.push(fullPath);
      }
    }
  }
  
  traverse(IMG_DIR);
  return images;
}

/**
 * Main function
 */
async function main() {
  console.log("🔍 Scanning for PNG images to optimize...");
  const images = findImages();
  
  if (images.length === 0) {
    console.log("⚠️  No PNG images found in public/img/");
    return;
  }
  
  console.log(`📁 Found ${images.length} PNG images to optimize\n`);
  
  let totalInputSize = 0;
  let totalOutputSize = 0;
  let optimizedCount = 0;
  
  for (const inputPath of images) {
    const result = await optimizeImage(inputPath);
    
    if (result) {
      totalInputSize += result.inputSize;
      totalOutputSize += result.outputSize;
      optimizedCount++;
    }
  }
  
  if (optimizedCount > 0) {
    const totalReduction = ((totalInputSize - totalOutputSize) / totalInputSize * 100).toFixed(1);
    console.log(
      `\n🎉 PNG Optimization complete!`
    );
    console.log(
      `   Total: ${formatBytes(totalInputSize)} → ${formatBytes(totalOutputSize)} | -${totalReduction}%`
    );
    console.log(
      `   ${optimizedCount}/${images.length} images optimized`
    );
  } else {
    console.log("\n⚠️  All images are already optimally compressed");
  }
}

// Run
main().catch(console.error);
