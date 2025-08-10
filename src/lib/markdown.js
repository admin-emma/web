// Función para convertir Markdown a HTML
export function markdownToHtml(markdown) {
  if (!markdown) return '';
  
  // Convertir markdown mejorado a HTML
  let htmlContent = markdown
    // Encabezados
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-3 mt-6">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-4 mt-8">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-8">$1</h1>')
    
    // Separadores horizontales
    .replace(/^---$/gim, '<hr class="border-t-2 border-gray-300 my-6">')
    
    // Imágenes
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full h-auto my-4 rounded">')
    
    // Texto en negrita y cursiva
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Listas numeradas (primero para evitar conflictos)
    .replace(/^\d+\.\s(.+)$/gim, '<li class="mb-2">$1</li>')
    
    // Listas con viñetas
    .replace(/^[-*]\s(.+)$/gim, '<li class="mb-2">$1</li>')
    
    // Citas
    .replace(/^>\s(.+)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 bg-blue-50 py-2 my-4">$1</blockquote>')
    
    // Párrafos (dividir por dobles saltos de línea)
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim();
      if (!paragraph) return '';
      
      // Si contiene <li>, convertir en lista
      if (paragraph.includes('<li')) {
        const isNumbered = /^\d+\./.test(paragraph);
        const listItems = paragraph.split('\n').filter(line => line.trim());
        const listType = isNumbered ? 'ol' : 'ul';
        const listClass = isNumbered ? 'list-decimal list-inside space-y-2 mb-4' : 'list-disc list-inside space-y-2 mb-4';
        return `<${listType} class="${listClass}">${listItems.join('')}</${listType}>`;
      }
      
      // Si ya es un elemento HTML (h1, h2, hr, blockquote), devolverlo tal como está
      if (paragraph.startsWith('<h') || paragraph.startsWith('<hr') || paragraph.startsWith('<blockquote')) {
        return paragraph;
      }
      
      // Si no está vacío, convertir en párrafo
      if (paragraph && !paragraph.startsWith('<')) {
        return `<p class="mb-4 text-gray-800 leading-relaxed">${paragraph.replace(/\n/g, '<br>')}</p>`;
      }
      
      return paragraph;
    })
    .join('\n');

  return htmlContent;
}
