class ModernBlog {
            constructor() {
                this.postsDir = 'https://raw.githubusercontent.com/MisterShawn/mistershawn.github.io/refs/heads/main/posts/';
                this.posts = [];
                this.filteredPosts = [];
                this.currentPage = 0;
                this.postsPerPage = 6;
                this.isLoading = false;
                this.activeTag = 'all';
                this.searchQuery = '';
                
                this.blogGrid = document.getElementById('blogGrid');
                this.loading = document.getElementById('loading');
                this.filterTags = document.getElementById('filterTags');
                this.searchInput = document.getElementById('searchInput');
                this.modal = document.getElementById('postModal');
                this.modalClose = document.getElementById('modalClose');
                
                this.init();
            }

            init() {
                this.loadPostsFromMarkdown().then(() => {
                    this.setupEventListeners();
                    this.loadPosts();
                });
            }

            async loadPostsFromMarkdown() {
                try {
                    // Load the posts index file
                    const response = await fetch(this.postsDir + 'index.json');
                    if (!response.ok) {
                        throw new Error('Failed to load posts index');
                    }
                    const postsIndex = await response.json();
                    
                    // Load each markdown file
                    const loadPromises = postsIndex.posts.map(async (postInfo) => {
                        try {
                            const postResponse = await fetch(this.postsDir + `${postInfo.file}`);
                            if (!postResponse.ok) {
                                throw new Error(`Failed to load post: ${postInfo.file}`);
                            }
                            const markdown = await postResponse.text();
                            return this.parseMarkdownPost(markdown, postInfo);
                        } catch (error) {
                            console.error(`Error loading post ${postInfo.file}:`, error);
                            return null;
                        }
                    });
                    
                    const loadedPosts = await Promise.all(loadPromises);
                    this.posts = loadedPosts.filter(post => post !== null);
                    
                    // Update available tags in the UI
                    this.updateAvailableTags();
                    
                } catch (error) {
                    console.error('Error loading posts from markdown:', error);
                    // Fallback to sample posts if markdown loading fails
                    this.generateSamplePosts();
                }
            }

            parseMarkdownPost(markdown, postInfo) {
                // Extract frontmatter
                const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
                let frontmatter = {};
                let content = markdown;
                
                if (frontmatterMatch) {
                    const frontmatterText = frontmatterMatch[1];
                    content = markdown.slice(frontmatterMatch[0].length).trim();
                    
                    // Simple YAML parser for frontmatter
                    frontmatterText.split('\n').forEach(line => {
                        const match = line.match(/^(\w+):\s*(.+)$/);
                        if (match) {
                            const [, key, value] = match;
                            if (key === 'tags') {
                                frontmatter[key] = value.split(',').map(tag => tag.trim());
                            } else if (key === 'readTime') {
                                frontmatter[key] = parseInt(value);
                            } else {
                                frontmatter[key] = value.replace(/^["']|["']$/g, '');
                            }
                        }
                    });
                }
                
                // Extract excerpt from content (first paragraph)
                const excerptMatch = content.match(/^(.+?)(?:\n\n|\n(?=#))/);
                const excerpt = excerptMatch ? excerptMatch[1].replace(/[#*`]/g, '').trim() : '';
                
                return {
                    id: postInfo.id || Date.now() + Math.random(),
                    title: frontmatter.title || 'Untitled Post',
                    excerpt: frontmatter.excerpt || excerpt || 'No excerpt available.',
                    tags: frontmatter.tags || ['general'],
                    date: frontmatter.date || new Date().toLocaleDateString(),
                    readTime: frontmatter.readTime || Math.ceil(content.length / 1000),
                    gradient: frontmatter.gradient || this.getRandomGradient(),
                    content: content,
                    author: frontmatter.author || 'Anonymous'
                };
            }

            getRandomGradient() {
                const gradients = [
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                ];
                return gradients[Math.floor(Math.random() * gradients.length)];
            }

            updateAvailableTags() {
                const allTags = new Set();
                this.posts.forEach(post => {
                    post.tags.forEach(tag => allTags.add(tag));
                });
                
                // Update the filter tags UI
                const filterTagsContainer = document.getElementById('filterTags');
                const existingAllTag = filterTagsContainer.querySelector('[data-tag="all"]');
                
                // Clear existing tags except "All"
                filterTagsContainer.innerHTML = '';
                if (existingAllTag) {
                    filterTagsContainer.appendChild(existingAllTag);
                } else {
                    const allTag = document.createElement('div');
                    allTag.className = 'tag active';
                    allTag.dataset.tag = 'all';
                    allTag.textContent = 'All';
                    filterTagsContainer.appendChild(allTag);
                }
                
                // Add tags from posts
                Array.from(allTags).sort().forEach(tag => {
                    const tagElement = document.createElement('div');
                    tagElement.className = 'tag';
                    tagElement.dataset.tag = tag;
                    tagElement.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
                    filterTagsContainer.appendChild(tagElement);
                });
            }

            generateSamplePosts() {
                // Fallback sample posts if markdown loading fails
                const samplePosts = [
                    {
                        id: 1,
                        title: "Welcome to ModernBlog",
                        excerpt: "This is a sample post. To use your own content, create markdown files in the 'posts' directory.",
                        tags: ['general'],
                        date: new Date().toLocaleDateString(),
                        readTime: 2,
                        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        content: "# Welcome to ModernBlog\n\nThis is a sample post to demonstrate the blog functionality."
                    }
                ];
                this.posts = samplePosts;
            }

            getRandomTags(allTags, count) {
                const shuffled = [...allTags].sort(() => 0.5 - Math.random());
                return shuffled.slice(0, count);
            }

            setupEventListeners() {
                // Infinite scroll
                let scrollTimeout;
                window.addEventListener('scroll', () => {
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
                            this.loadPosts();
                        }
                    }, 100);
                });

                // Tag filtering
                this.filterTags.addEventListener('click', (e) => {
                    if (e.target.classList.contains('tag')) {
                        this.handleTagClick(e.target);
                    }
                });

                // Search functionality
                let searchTimeout;
                this.searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        this.handleSearch(e.target.value);
                    }, 300);
                });

                // Modal functionality
                this.modalClose.addEventListener('click', () => {
                    this.closeModal();
                });

                this.modal.addEventListener('click', (e) => {
                    if (e.target === this.modal) {
                        this.closeModal();
                    }
                });

                // Close modal with Escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                        this.closeModal();
                    }
                });

                // Blog post clicks
                this.blogGrid.addEventListener('click', (e) => {
                    const postElement = e.target.closest('.blog-post');
                    if (postElement) {
                        const postId = parseInt(postElement.dataset.postId);
                        this.openPost(postId);
                    }
                });
            }

            handleTagClick(tagElement) {
                // Update active tag
                document.querySelector('.tag.active').classList.remove('active');
                tagElement.classList.add('active');
                
                this.activeTag = tagElement.dataset.tag;
                this.currentPage = 0;
                this.blogGrid.innerHTML = '';
                this.filterAndLoadPosts();
            }

            handleSearch(query) {
                this.searchQuery = query.toLowerCase();
                this.currentPage = 0;
                this.blogGrid.innerHTML = '';
                this.filterAndLoadPosts();
            }

            filterAndLoadPosts() {
                this.filteredPosts = this.posts.filter(post => {
                    const matchesTag = this.activeTag === 'all' || post.tags.includes(this.activeTag);
                    const matchesSearch = !this.searchQuery || 
                        post.title.toLowerCase().includes(this.searchQuery) ||
                        post.excerpt.toLowerCase().includes(this.searchQuery) ||
                        post.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));
                    
                    return matchesTag && matchesSearch;
                });
                
                this.loadPosts();
            }

            loadPosts() {
                if (this.isLoading) return;
                
                const startIndex = this.currentPage * this.postsPerPage;
                const postsToShow = this.filteredPosts.length > 0 ? this.filteredPosts : this.posts;
                const endIndex = Math.min(startIndex + this.postsPerPage, postsToShow.length);
                
                if (startIndex >= postsToShow.length) return;
                
                this.isLoading = true;
                this.loading.classList.remove('hidden');
                
                // Simulate loading delay
                setTimeout(() => {
                    const postsToLoad = postsToShow.slice(startIndex, endIndex);
                    postsToLoad.forEach((post, index) => {
                        setTimeout(() => {
                            this.renderPost(post);
                        }, index * 100);
                    });
                    
                    this.currentPage++;
                    this.isLoading = false;
                    this.loading.classList.add('hidden');
                }, 800);
            }

            renderPost(post) {
                const postElement = document.createElement('article');
                postElement.className = 'blog-post';
                postElement.dataset.postId = post.id;
                postElement.style.animationDelay = '0s';
                postElement.style.cursor = 'pointer';
                
                postElement.innerHTML = `
                    <div class="post-image" style="background: ${post.gradient}">
                        ${post.title.charAt(0)}
                    </div>
                    <div class="post-content">
                        <div class="post-meta">
                            <span>${post.date}</span>
                            <span>${post.readTime} min read</span>
                        </div>
                        <h3 class="post-title">${post.title}</h3>
                        <p class="post-excerpt">${post.excerpt}</p>
                        <div class="post-tags">
                            ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                        </div>
                        <button class="read-more-btn">Read More</button>
                    </div>
                `;
                
                this.blogGrid.appendChild(postElement);
            }

            openPost(postId) {
                const post = this.posts.find(p => p.id == postId);
                if (!post) return;

                // Populate modal content
                document.getElementById('modalTitle').textContent = post.title;
                document.getElementById('modalDate').textContent = post.date;
                document.getElementById('modalReadTime').textContent = `${post.readTime} min read`;
                document.getElementById('modalAuthor').textContent = post.author || 'Anonymous';
                
                // Populate tags
                const modalTags = document.getElementById('modalTags');
                modalTags.innerHTML = post.tags.map(tag => 
                    `<span class="modal-tag">${tag}</span>`
                ).join('');

                // Convert markdown to HTML (simple conversion)
                const htmlContent = this.markdownToHtml(post.content);
                document.getElementById('modalContent').innerHTML = htmlContent;

                // Show modal
                this.modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            closeModal() {
                this.modal.classList.remove('active');
                document.body.style.overflow = '';
            }

            markdownToHtml(markdown) {
                // Simple markdown to HTML conversion
                let html = markdown;
                
                // Headers
                html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
                html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
                html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
                
                // Bold
                html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
                html = html.replace(/\_\_(.*\_\_)/gim, '<strong>$1</strong>');
                
                // Italic
                html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
                html = html.replace(/\_(.*\_)/gim, '<em>$1</em>');
                
                // Code blocks
                html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
                
                // Inline code
                html = html.replace(/`([^`]*)`/gim, '<code>$1</code>');
                
                // Links
                html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank">$1</a>');
                
                // Line breaks and paragraphs
                html = html.replace(/\n\n/gim, '</p><p>');
                html = html.replace(/\n/gim, '<br>');
                
                // Wrap in paragraphs
                html = '<p>' + html + '</p>';
                
                // Clean up empty paragraphs
                html = html.replace(/<p><\/p>/gim, '');
                html = html.replace(/<p><h([1-6])>/gim, '<h$1>');
                html = html.replace(/<\/h([1-6])><\/p>/gim, '</h$1>');
                html = html.replace(/<p><pre>/gim, '<pre>');
                html = html.replace(/<\/pre><\/p>/gim, '</pre>');
                
                return html;
            }
        }

        // Initialize the blog when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new ModernBlog();
        });