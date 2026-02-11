# Portfolio Website

A modern, responsive portfolio website with dark mode support, built using HTML5, CSS3, and vanilla JavaScript. Features a clean, bold design with smooth animations and mobile-friendly navigation.

![Portfolio Preview](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

- **Responsive Design**: Fully responsive layout that works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes with persistent preference storage
- **Smooth Animations**: Engaging animations and micro-interactions throughout the site
- **Mobile Navigation**: Hamburger menu for mobile devices with smooth slide-in animation
- **Flexbox Layout**: Modern CSS Flexbox for flexible and efficient layouts
- **Interactive Elements**: Hover effects, smooth scrolling, and form validation
- **Clean Code**: Well-organized, semantic HTML and modular CSS

## 🎨 Sections

1. **Hero Section**: Eye-catching introduction with animated title and call-to-action buttons
2. **About**: Personal introduction with profile image placeholder
3. **Skills**: Interactive skill cards showcasing technical expertise in three categories
4. **Projects**: Featured project cards with descriptions and links
5. **Contact**: Contact form and contact information with social links
6. **Footer**: Social media links and copyright information

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A text editor (VS Code, Sublime Text, Atom, etc.)

### Installation

1. Clone or download this repository:
```bash
git clone https://github.com/yourusername/portfolio-website.git
```

2. Navigate to the project directory:
```bash
cd portfolio-website
```

3. Open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or simply double-click the `index.html` file.

## 📁 File Structure

```
portfolio-website/
│
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
└── README.md          # Project documentation
```

## 🎯 Customization Guide

### 1. Personal Information

Update the following in `index.html`:

**Hero Section:**
```html
<h1 class="hero-title">
    YOUR NAME
    <span>YOUR TITLE</span>
</h1>
<p class="hero-subtitle">
    Your personal tagline or description
</p>
```

**About Section:**
- Replace placeholder text with your bio
- Update the profile image (replace the SVG placeholder with your image URL)

**Contact Section:**
```html
<a href="mailto:your.email@example.com" class="contact-method">
    <span>📧</span>
    <span>your.email@example.com</span>
</a>
```

### 2. Colors and Theme

Customize colors in `styles.css` by modifying the CSS variables:

```css
:root {
    --bg-primary: #f8f7f4;      /* Main background color */
    --accent: #ff6b35;           /* Primary accent color */
    --text-primary: #1a1a1a;     /* Main text color */
    /* ... other variables ... */
}
```

### 3. Typography

Change fonts by updating the Google Fonts import in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap" rel="stylesheet">
```

Then update the font-family in `styles.css`:

```css
body {
    font-family: 'Your Font', sans-serif;
}
```

### 4. Skills

Update the skill cards with your own technologies:

```html
<div class="skill-card">
    <h3>Your Skill Category</h3>
    <p>Your description</p>
    <div class="skill-tags">
        <span class="tag">Technology 1</span>
        <span class="tag">Technology 2</span>
        <!-- Add more tags -->
    </div>
</div>
```

### 5. Projects

Add your own projects by modifying the project cards:

```html
<div class="project-card">
    <div class="project-image">🎯</div>
    <div class="project-info">
        <h3>Project Name</h3>
        <p>Project description</p>
        <div class="project-links">
            <a href="your-live-url" class="project-link">View Live</a>
            <a href="your-github-url" class="project-link">GitHub</a>
        </div>
    </div>
</div>
```

## 📱 Responsive Breakpoints

The website uses the following breakpoints:

- **Desktop**: Default (1400px max-width container)
- **Tablet**: 968px and below
- **Mobile**: 640px and below

## 🎨 Color Schemes

### Light Mode
- Background: `#f8f7f4`
- Accent: `#ff6b35`
- Text: `#1a1a1a`

### Dark Mode
- Background: `#0f0f0f`
- Accent: `#ff7b52`
- Text: `#f0f0f0`

## 🔧 Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Styling, animations, and responsive design
  - Flexbox for layouts
  - CSS Grid (optional enhancement)
  - CSS Variables for theming
  - Media queries for responsiveness
- **JavaScript**: Interactive features
  - Dark mode toggle
  - Mobile menu
  - Smooth scrolling
  - Form handling
  - Local storage for theme persistence

## ✅ Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Opera (latest)

## 📝 To-Do / Future Enhancements

- [ ] Add project images instead of emoji placeholders
- [ ] Implement actual form submission (e.g., using FormSpree or EmailJS)
- [ ] Add a blog section
- [ ] Include testimonials/recommendations
- [ ] Add loading animations
- [ ] Integrate Google Analytics
- [ ] Add SEO meta tags
- [ ] Include Open Graph tags for social sharing
- [ ] Add a 404 page
- [ ] Implement progressive web app (PWA) features

## 🤝 Contributing

Feel free to fork this project and customize it for your own use. If you'd like to contribute improvements:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Your Name**

- Website: [yourwebsite.com](https://yourwebsite.com)
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)
- Twitter: [@yourhandle](https://twitter.com/yourhandle)

## 🙏 Acknowledgments

- Google Fonts for the beautiful typography (Bebas Neue and Manrope)
- Inspiration from modern portfolio designs
- The web development community

---

**Note**: Remember to replace all placeholder content (name, email, links, images) with your actual information before deploying.

## 📞 Support

If you have any questions or need help customizing this template, feel free to open an issue or reach out!

---

⭐ If you find this portfolio template helpful, please consider giving it a star!
