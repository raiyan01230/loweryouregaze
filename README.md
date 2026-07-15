# Self-Discipline Warning Applet

This is a personal self-discipline screen built with vanilla HTML, CSS, and JavaScript designed to intercept and interrupt browsing before accessing a blocked website. It provides a solemn reminder to remember Allah and maintain self-discipline.

## Setup & File Structure

This applet runs in an Express + Vite full-stack environment. The main files are:
* `/index.html`: The full-screen structure with background video, audio warnings, and custom overlay.
* `/src/index.css`: Global styles including custom keyframe animations and styling classes.
* `/src/main.tsx`: Client entry point that handles audio autoplay checking, background loop initialization, and button redirects.

The user's local video and audio are used to complete the atmospheric warning.
