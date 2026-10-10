# 🌬️ IKS Windmill Simulator

An interactive **windmill simulation website** created as an educational project for **Indian Knowledge System (IKS)**.

The project demonstrates how wind energy can be converted into useful electrical energy through an interactive virtual windmill.

## ✨ Features

* 🌪️ Interactive wind-speed control
* ⚙️ Real-time rotor RPM calculation
* ⚡ Power output estimation
* 🛑 Brake control
* 💨 Wind gust simulation
* 🔄 Automatic wind-speed sweep
* 🎨 Animated canvas-based windmill
* 🔋 Energy conversion flow visualization
* 📚 IKS context and sustainability section
* 👥 Project team section
* 📱 Responsive design
* 🐦 Bootstrap-based UI
* 🌐 GitHub Pages compatible

## 🔬 Simulation

The simulator uses a simplified educational model to demonstrate the relationship between wind speed and generated power.

The main concept is:

```text
Wind → Blades → Shaft → Generator → Electrical Power
```

The simulation demonstrates the approximate relationship:

```text
Power ∝ Wind Speed³
```

The values are intended for **educational visualization**, not real-world wind turbine engineering calculations.

## 🛠️ Technologies Used

* HTML5
* CSS3
* JavaScript
* Bootstrap 5
* HTML Canvas
* Google Fonts

## 📁 Project Structure

```text
iks-windmill-simulator/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🚀 Run Locally

No installation or build process is required.

Simply open:

```text
index.html
```

in a modern web browser.

Alternatively, use a local development server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## 🌐 GitHub Pages

This project is a static website and can be deployed directly using GitHub Pages.

### Steps

1. Create a GitHub repository.
2. Upload all project files.
3. Make sure `index.html` is in the repository root.
4. Go to:

```text
Settings → Pages
```

5. Under **Build and deployment**, select:

```text
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

6. Save.

GitHub will provide the published website URL.


## DevOps Pipeline

This project uses Git and GitHub for version control, GitHub Actions
for automated testing and deployment, and Docker to run the website
in an Nginx container.

### Run with Docker

```bash
docker build -t windmill-simulator .
docker run -d --name windmill-app -p 8080:80 windmill-simulator
```

Open http://localhost:8080 in your browser.

### Run Tests

```bash
python -m unittest discover -s tests -v
```

### CI/CD

The GitHub Actions workflow runs automated tests, builds the Docker
image, and deploys the static website to GitHub Pages.


## 👥 Project Team

* **Ajay Maurya**
* **Shubham Lawate**
* **Karan Rana**
* **Rashad Qureshi**
* **Bhupati Nadar**
* **Vaibhav Singh**
* **Ved Thakur**

## 📖 Academic Context

This project was developed as part of an **Indian Knowledge System (IKS)** academic activity.

It connects the traditional idea of observing and utilizing natural forces with a modern technological application of **wind energy conversion**.

## ⚠️ Note

This is an **educational simulation**. The RPM, power output, and efficiency values are simplified and should not be used for actual wind turbine design or engineering calculations.

---

Made for educational purposes as part of the **Indian Knowledge System (IKS)** project.
