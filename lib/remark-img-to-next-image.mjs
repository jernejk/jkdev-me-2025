/**
 * Remark plugin to convert markdown images to Next.js Image component
 * This enables progressive loading with blur placeholders for all markdown images
 */
import { visit } from 'unist-util-visit'

export function remarkImgToNextImage() {
  return (tree) => {
    visit(tree, 'image', (node, index, parent) => {
      // Skip if it's already wrapped or processed
      if (!node.url) return

      // Only convert images that start with /content/images/ (our blog images)
      if (!node.url.startsWith('/content/images/')) return

      // Convert to JSX node for Next.js Image component
      const imageNode = {
        type: 'mdxJsxFlowElement',
        name: 'Image',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'src',
            value: node.url,
          },
          {
            type: 'mdxJsxAttribute',
            name: 'alt',
            value: node.alt || '',
          },
        ],
        children: [],
      }

      // Replace the image node with the Image component
      parent.children[index] = imageNode
    })
  }
}
