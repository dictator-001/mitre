# Enterprise MITRE ATT&CK Matrix Visualizer

A dynamic, front-end visualizer for the MITRE ATT&CK Framework. Built with vanilla JavaScript, HTML, and CSS, it asynchronously fetches the live STIX data from MITRE's official repository and parses it into a high-density, horizontal-scrolling tactical matrix.

## Features
- **Dynamic STIX Parsing**: Pulls the master `enterprise-attack.json` directly from the official MITRE repository.
- **Official Matrix Layout**: Architected to match the 14-column Enterprise Matrix framework exactly.
- **Rich Markdown Formatting**: Fully parses STIX description syntax into clean HTML for readability using `marked.js`.
- **Dark/Light Mode**: Full CSS variable support for theme switching.

## Future Roadmap 🚀
- [ ] Implement Mobile Matrix framework integration.
- [ ] Implement ICS (Industrial Control Systems) framework integration.
- [ ] Implement MITRE D3FEND defensive countermeasures mapping.

## Running Locally
Because this project utilizes 100% client-side technologies without a backend, you can serve it via any basic web server to avoid CORS constraints:
```bash
python -m http.server 8080
```
Then navigate to `http://localhost:8080`

## Deployment
This project is natively compatible with **GitHub Pages**. Simply upload to a public repository and enable GitHub Pages on the `main` branch to host it for free.
