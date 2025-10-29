<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EduPlayground - Interactive Learning Platform</title>
  <style>
    :root {
      --primary: #6563ff;
      --secondary: #ff6b6b;
      --accent1: #4ecdc4;
      --accent2: #ffbe0b;
      --light: #f7f7f7;
      --dark: #2c2c2c;
      --border-radius: 18px;
      --card-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    body {
      background-color: var(--light);
      color: var(--dark);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      padding: 20px;
      overflow-x: hidden;
    }

    .container {
      max-width: 700px;
      width: 100%;
      height: 700px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--primary) var(--light);
    }

    .container::-webkit-scrollbar {
      width: 8px;
    }

    .container::-webkit-scrollbar-thumb {
      background-color: var(--primary);
      border-radius: 10px;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
      position: relative;
    }

    .header h1 {
      font-size: 2.2rem;
      color: var(--dark);
      margin-bottom: 10px;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      position: relative;
      display: inline-block;
    }

    .header p {
      font-size: 1rem;
      color: var(--dark);
      opacity: 0.8;
      max-width: 500px;
      margin: 0 auto;
    }

    .module-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .module {
      background: white;
      border-radius: var(--border-radius);
      overflow: hidden;
      position: relative;
      cursor: pointer;
      height: 160px;
      transition: var(--transition);
      box-shadow: var(--card-shadow);
    }

    .module::before {
      content: "";
      position: absolute;
      inset: 0;
      border: 3px solid transparent;
      border-radius: var(--border-radius);
      background: linear-gradient(45deg, var(--accent2), var(--accent1)) border-box;
      -webkit-mask: 
        linear-gradient(#fff 0 0) padding-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: var(--transition);
    }

    .module:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .module:hover::before {
      opacity: 1;
    }

    .module .icon {
      position: absolute;
      top: 15px;
      right: 15px;
      background: var(--light);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: var(--primary);
      transition: var(--transition);
    }

    .module:hover .icon {
      background: var(--primary);
      color: white;
      transform: rotate(360deg);
    }

    .module .content {
      padding: 20px;
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .module h3 {
      font-size: 1.2rem;
      margin-bottom: 8px;
      color: var(--dark);
    }

    .module p {
      font-size: 0.85rem;
      color: var(--dark);
      opacity: 0.8;
    }

    .module .progress {
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      margin-top: 10px;
      overflow: hidden;
    }

    .module .progress-bar {
      height: 100%;
      border-radius: 3px;
      transition: var(--transition);
    }

    .learning-cards {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .card {
      background: white;
      border-radius: var(--border-radius);
      overflow: hidden;
      position: relative;
      cursor: pointer;
      transition: var(--transition);
      box-shadow: var(--card-shadow);
    }

    .card::before {
      content: "";
      position: absolute;
      inset: 0;
      border: 3px solid transparent;
      border-radius: var(--border-radius);
      background: linear-gradient(45deg, var(--primary), var(--secondary)) border-box;
      -webkit-mask: 
        linear-gradient(#fff 0 0) padding-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: var(--transition);
      z-index: 1;
    }

    .card:hover {
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .card:hover::before {
      opacity: 1;
    }

    .card .card-content {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      position: relative;
      z-index: 0;
    }

    .card .card-icon {
      min-width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      color: white;
      transition: var(--transition);
    }

    .card:hover .card-icon {
      transform: scale(1.1);
    }

    .card .card-text {
      flex: 1;
    }

    .card h3 {
      font-size: 1.1rem;
      margin-bottom: 5px;
      color: var(--dark);
    }

    .card p {
      font-size: 0.85rem;
      color: var(--dark);
      opacity: 0.8;
    }

    .card .card-action {
      background: var(--light);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: var(--primary);
      transition: var(--transition);
    }

    .card:hover .card-action {
      background: var(--primary);
      color: white;
      transform: rotate(90deg);
    }

    .section-title {
      font-size: 1.5rem;
      margin-bottom: 15px;
      color: var(--dark);
      position: relative;
      display: inline-block;
    }

    .section-title::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: -5px;
      width: 40px;
      height: 4px;
      background: var(--accent1);
      border-radius: 2px;
    }

    .featured-module {
      background: white;
      border-radius: var(--border-radius);
      overflow: hidden;
      position: relative;
      margin-bottom: 30px;
      box-shadow: var(--card-shadow);
      transition: var(--transition);
    }

    .featured-module::before {
      content: "";
      position: absolute;
      inset: 0;
      border: 3px solid transparent;
      border-radius: var(--border-radius);
      background: linear-gradient(45deg, var(--primary), var(--secondary)) border-box;
      -webkit-mask: 
        linear-gradient(#fff 0 0) padding-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: var(--transition);
      z-index: 1;
    }

    .featured-module:hover::before {
      opacity: 1;
    }

    .featured-content {
      padding: 25px;
      position: relative;
      z-index: 0;
    }

    .featured-tag {
      display: inline-block;
      background: var(--accent2);
      color: var(--dark);
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 15px;
    }

    .featured-module h2 {
      font-size: 1.4rem;
      margin-bottom: 12px;
      color: var(--dark);
    }

    .featured-module p {
      font-size: 0.9rem;
      color: var(--dark);
      opacity: 0.8;
      margin-bottom: 20px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary);
      color: white;
      padding: 10px 20px;
      border-radius: 30px;
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      transition: var(--transition);
      border: none;
      cursor: pointer;
    }

    .btn:hover {
      background: #5452e3;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(101, 99, 255, 0.3);
    }

    .btn .icon {
      font-size: 18px;
    }

    .color-primary { background: var(--primary); }
    .color-secondary { background: var(--secondary); }
    .color-accent1 { background: var(--accent1); }
    .color-accent2 { background: var(--accent2); }

    .pulse {
      position: relative;
    }

    .pulse::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      animation: pulse 2s infinite;
      z-index: -1;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(101, 99, 255, 0.5);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(101, 99, 255, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(101, 99, 255, 0);
      }
    }

    @media (max-width: 600px) {
      .module-grid {
        grid-template-columns: 1fr 1fr;
      }

      .header h1 {
        font-size: 1.8rem;
      }

      .section-title {
        font-size: 1.3rem;
      }

      .featured-module h2 {
        font-size: 1.2rem;
      }
    }

    @media (max-width: 400px) {
      .module-grid {
        grid-template-columns: 1fr;
      }

      .card .card-content {
        flex-direction: column;
        text-align: center;
      }

      .card .card-action {
        position: absolute;
        top: 15px;
        right: 15px;
      }
    }

    @keyframes borderAnimation {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EduPlayground</h1>
      <p>Discover playful learning experiences designed to engage and inspire curiosity</p>
    </div>

    <div class="featured-module">
      <div class="featured-content">
        <span class="featured-tag">New Course</span>
        <h2>Hands-on Data Visualization</h2>
        <p>Transform complex data into compelling visual stories. Learn techniques for creating clear, interactive, and impactful visualizations for diverse audiences.</p>
        <button class="btn pulse">
          <span>Start Learning</span>
          <span class="icon">→</span>
        </button>
      </div>
    </div>

    <h2 class="section-title">Continue Learning</h2>
    <div class="module-grid">
      <div class="module" data-progress="72">
        <div class="content">
          <div>
            <h3>Coding Fundamentals</h3>
            <p>Build your programming foundation</p>
          </div>
          <div class="progress">
            <div class="progress-bar color-primary" style="width: 72%"></div>
          </div>
        </div>
        <div class="icon">★</div>
      </div>

      <div class="module" data-progress="45">
        <div class="content">
          <div>
            <h3>Design Thinking</h3>
            <p>Creative problem-solving methods</p>
          </div>
          <div class="progress">
            <div class="progress-bar color-secondary" style="width: 45%"></div>
          </div>
        </div>
        <div class="icon">✦</div>
      </div>

      <div class="module" data-progress="18">
        <div class="content">
          <div>
            <h3>AI Essentials</h3>
            <p>Understanding machine learning</p>
          </div>
          <div class="progress">
            <div class="progress-bar color-accent1" style="width: 18%"></div>
          </div>
        </div>
        <div class="icon">◆</div>
      </div>

      <div class="module" data-progress="90">
        <div class="content">
          <div>
            <h3>Digital Storytelling</h3>
            <p>Craft compelling narratives</p>
          </div>
          <div class="progress">
            <div class="progress-bar color-accent2" style="width: 90%"></div>
          </div>
        </div>
        <div class="icon">♦</div>
      </div>
    </div>

    <h2 class="section-title">Recommended For You</h2>
    <div class="learning-cards">
      <div class="card">
        <div class="card-content">
          <div class="card-icon color-primary">🔍</div>
          <div class="card-text">
            <h3>Critical Thinking Workshop</h3>
            <p>Develop analytical skills to evaluate information with clarity and precision</p>
          </div>
          <div class="card-action">+</div>
        </div>
      </div>

      <div class="card">
        <div class="card-content">
          <div class="card-icon color-secondary">🧪</div>
          <div class="card-text">
            <h3>Science of Learning</h3>
            <p>Discover research-backed techniques to improve retention and understanding</p>
          </div>
          <div class="card-action">+</div>
        </div>
      </div>

      <div class="card">
        <div class="card-content">
          <div class="card-icon color-accent1">🎨</div>
          <div class="card-text">
            <h3>Visual Communication</h3>
            <p>Express complex ideas through effective visual elements and design principles</p>
          </div>
          <div class="card-action">+</div>
        </div>
      </div>

      <div class="card">
        <div class="card-content">
          <div class="card-icon color-accent2">🔗</div>
          <div class="card-text">
            <h3>Systems Thinking</h3>
            <p>Identify connections and relationships between different elements in complex systems</p>
          </div>
          <div class="card-action">+</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize progress bars
      const modules = document.querySelectorAll('.module');
      modules.forEach(module => {
        const progress = module.getAttribute('data-progress');
        const progressBar = module.querySelector('.progress-bar');
        
        // Start with 0 width and animate to actual progress
        progressBar.style.width = '0%';
        setTimeout(() => {
          progressBar.style.width = `${progress}%`;
        }, 300);
      });

      // Add click event listeners to all interactive elements
      const clickableItems = document.querySelectorAll('.module, .card, .btn');
      clickableItems.forEach(item => {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Create ripple effect
          const ripple = document.createElement('div');
          ripple.classList.add('ripple');
          ripple.style.position = 'absolute';
          ripple.style.borderRadius = '50%';
          ripple.style.transform = 'scale(0)';
          ripple.style.background = 'rgba(255, 255, 255, 0.3)';
          ripple.style.pointerEvents = 'none';
          ripple.style.width = '100px';
          ripple.style.height = '100px';
          ripple.style.transition = 'transform 0.6s, opacity 0.6s';
          ripple.style.zIndex = '0';
          
          const rect = item.getBoundingClientRect();
          const x = e.clientX - rect.left - 50;
          const y = e.clientY - rect.top - 50;
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          
          item.appendChild(ripple);
          
          setTimeout(() => {
            ripple.style.transform = 'scale(4)';
            ripple.style.opacity = '0';
            
            setTimeout(() => {
              ripple.remove();
            }, 600);
          }, 10);

          // Simulate module or card selection
          const wasSelected = item.classList.contains('selected');
          
          // Toggle selection if clicking on a module or card (not the button)
          if (!item.classList.contains('btn')) {
            if (!wasSelected) {
              // Deselect all others
              document.querySelectorAll('.selected').forEach(el => {
                el.classList.remove('selected');
              });
              
              item.classList.add('selected');
              
              // Additional feedback for selection
              const icon = item.querySelector('.icon, .card-icon');
              if (icon) {
                const originalTransform = icon.style.transform;
                icon.style.transform = originalTransform + ' scale(1.2)';
                setTimeout(() => {
                  icon.style.transform = originalTransform;
                }, 300);
              }
            }
          }
        });
      });

      // Hover effects for cards and modules
      const hoverItems = document.querySelectorAll('.card, .module');
      hoverItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
          const before = window.getComputedStyle(item, '::before');
          if (before) {
            item.style.setProperty('--hover-animation', 'borderAnimation 3s linear infinite');
          }
        });
        
        item.addEventListener('mouseleave', function() {
          item.style.setProperty('--hover-animation', 'none');
        });
      });
    });
  </script>
</body>