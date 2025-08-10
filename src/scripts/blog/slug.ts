/**
 * Blog Post Detail Page Scripts
 * Manages individual blog post functionality including reading progress, sharing, and navigation
 */

interface BlogPostData {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage: string;
}

interface BlogPostManager {
  post: BlogPostData | null;
  readingProgress: number;
  estimatedReadTime: number;
}

class BlogSlugManager implements BlogPostManager {
  post: BlogPostData | null = null;
  readingProgress: number = 0;
  estimatedReadTime: number = 0;

  private progressBar: HTMLElement | null = null;
  private shareButtons: NodeListOf<HTMLButtonElement> | null = null;
  private tocLinks: NodeListOf<HTMLAnchorElement> | null = null;
  private backToTopButton: HTMLButtonElement | null = null;
  private contentArea: HTMLElement | null = null;

  constructor() {
    this.initializeElements();
    this.calculateReadingTime();
    this.attachEventListeners();
    this.generateTableOfContents();
    this.highlightCodeBlocks();
  }

  private initializeElements(): void {
    this.progressBar = document.querySelector('#reading-progress') as HTMLElement;
    this.shareButtons = document.querySelectorAll('[data-share]') as NodeListOf<HTMLButtonElement>;
    this.tocLinks = document.querySelectorAll('#toc a') as NodeListOf<HTMLAnchorElement>;
    this.backToTopButton = document.querySelector('#back-to-top') as HTMLButtonElement;
    this.contentArea = document.querySelector('#blog-content') as HTMLElement;
  }

  private attachEventListeners(): void {
    // Reading progress tracking
    window.addEventListener('scroll', this.updateReadingProgress.bind(this));

    // Share functionality
    if (this.shareButtons) {
      this.shareButtons.forEach(button => {
        button.addEventListener('click', this.handleShare.bind(this));
      });
    }

    // Table of contents navigation
    if (this.tocLinks) {
      this.tocLinks.forEach(link => {
        link.addEventListener('click', this.handleTocClick.bind(this));
      });
    }

    // Back to top button
    if (this.backToTopButton) {
      this.backToTopButton.addEventListener('click', this.scrollToTop.bind(this));
    }

    // Copy code functionality
    this.attachCodeCopyListeners();

    // Image zoom functionality
    this.attachImageZoomListeners();
  }

  private updateReadingProgress(): void {
    if (!this.contentArea) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.pageYOffset;
    
    this.readingProgress = Math.min((scrollTop / documentHeight) * 100, 100);

    if (this.progressBar) {
      this.progressBar.style.width = `${this.readingProgress}%`;
    }

    // Show/hide back to top button
    if (this.backToTopButton) {
      this.backToTopButton.classList.toggle('opacity-0', scrollTop < 300);
      this.backToTopButton.classList.toggle('pointer-events-none', scrollTop < 300);
    }

    // Update active TOC item
    this.updateActiveTocItem();
  }

  private updateActiveTocItem(): void {
    if (!this.tocLinks) return;

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let currentHeading: Element | null = null;

    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 100) {
        currentHeading = heading;
      }
    });

    this.tocLinks.forEach(link => {
      const isActive = currentHeading && 
        link.getAttribute('href') === `#${(currentHeading as HTMLElement).id}`;
      
      link.classList.toggle('text-[#035AA6]', Boolean(isActive));
      link.classList.toggle('font-semibold', Boolean(isActive));
      link.classList.toggle('text-gray-600', !isActive);
    });
  }

  private calculateReadingTime(): void {
    if (!this.contentArea) return;

    const text = this.contentArea.textContent || '';
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    this.estimatedReadTime = Math.ceil(wordCount / wordsPerMinute);

    // Update reading time display
    const readTimeElement = document.querySelector('#reading-time');
    if (readTimeElement) {
      readTimeElement.textContent = `${this.estimatedReadTime} min de lectura`;
    }
  }

  private generateTableOfContents(): void {
    if (!this.contentArea) return;

    const headings = this.contentArea.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const tocContainer = document.querySelector('#table-of-contents');

    if (!tocContainer || headings.length === 0) return;

    const tocList = document.createElement('ul');
    tocList.className = 'space-y-2 text-sm';

    headings.forEach((heading, index) => {
      // Generate ID if it doesn't exist
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }

      const li = document.createElement('li');
      const a = document.createElement('a');
      
      a.href = `#${heading.id}`;
      a.textContent = heading.textContent || '';
      a.className = 'text-gray-600 hover:text-[#035AA6] transition-colors duration-200 block py-1';
      
      // Indent based on heading level
      const level = parseInt(heading.tagName.charAt(1));
      li.style.marginLeft = `${(level - 1) * 12}px`;
      
      li.appendChild(a);
      tocList.appendChild(li);
    });

    tocContainer.appendChild(tocList);
  }

  private handleShare(e: Event): void {
    const button = e.target as HTMLButtonElement;
    const shareType = button.dataset.share;
    const url = window.location.href;
    const title = document.title;

    switch (shareType) {
      case 'twitter':
        this.shareToTwitter(url, title);
        break;
      case 'linkedin':
        this.shareToLinkedIn(url, title);
        break;
      case 'facebook':
        this.shareToFacebook(url);
        break;
      case 'copy':
        this.copyToClipboard(url);
        break;
      default:
        console.warn('Unknown share type:', shareType);
    }
  }

  private shareToTwitter(url: string, title: string): void {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=400');
  }

  private shareToLinkedIn(url: string, title: string): void {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    window.open(linkedinUrl, '_blank', 'width=550,height=400');
  }

  private shareToFacebook(url: string): void {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=400');
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.showNotification('¡Enlace copiado al portapapeles!', 'success');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      this.showNotification('Error al copiar el enlace', 'error');
    }
  }

  private handleTocClick(e: Event): void {
    e.preventDefault();
    const link = e.target as HTMLAnchorElement;
    const targetId = link.getAttribute('href');
    
    if (targetId) {
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }

  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  private attachCodeCopyListeners(): void {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
      const pre = block.parentElement;
      if (!pre) return;

      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.innerHTML = '<i class="fas fa-copy"></i>';
      copyButton.className = 'absolute top-2 right-2 bg-[#035AA6] text-white px-2 py-1 rounded text-xs hover:bg-[#07598C] transition-colors';
      copyButton.setAttribute('title', 'Copiar código');

      // Position relative for absolute button
      pre.style.position = 'relative';
      pre.appendChild(copyButton);

      copyButton.addEventListener('click', async () => {
        const code = block.textContent || '';
        await this.copyToClipboard(code);
        
        // Visual feedback
        copyButton.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
      });
    });
  }

  private attachImageZoomListeners(): void {
    const images = document.querySelectorAll('#blog-content img');
    
    images.forEach(img => {
      img.addEventListener('click', () => {
        this.openImageModal(img as HTMLImageElement);
      });
      
      // Add cursor pointer
      (img as HTMLElement).style.cursor = 'pointer';
    });
  }

  private openImageModal(img: HTMLImageElement): void {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    
    // Create image container
    const imgContainer = document.createElement('div');
    imgContainer.className = 'relative max-w-full max-h-full';
    
    // Create enlarged image
    const enlargedImg = document.createElement('img');
    enlargedImg.src = img.src;
    enlargedImg.alt = img.alt;
    enlargedImg.className = 'max-w-full max-h-full object-contain';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.className = 'absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors';
    
    // Assemble modal
    imgContainer.appendChild(enlargedImg);
    imgContainer.appendChild(closeButton);
    modal.appendChild(imgContainer);
    document.body.appendChild(modal);
    
    // Event listeners
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // ESC key to close
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscKey);
      }
    };
    document.addEventListener('keydown', handleEscKey);
  }

  private highlightCodeBlocks(): void {
    // Add syntax highlighting classes if using a library like Prism.js
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
      block.classList.add('language-javascript'); // Default, can be enhanced
      // If using Prism.js: Prism.highlightElement(block);
    });
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full ${
      type === 'success' 
        ? 'bg-[#038C7F] text-white' 
        : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new BlogSlugManager();
});

// Export for potential external use
export { BlogSlugManager };
