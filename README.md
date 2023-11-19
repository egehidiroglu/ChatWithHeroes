# Chat with Heroes: A Rails Application

## Overview

Chat with Heroes is a Ruby on Rails application that combines real-time interaction with fictional characters through a chat interface. Leveraging the Rails backend, WebSocket communication, and external APIs, this application offers a platform for users to engage in AI-powered conversations, enhanced with audio feedback.

## Key Features

- **Dynamic Character Interaction**: Users choose from characters like Anakin Skywalker, Optimus Prime, and Batman, each triggering a unique audio clip upon selection (under progress).
- **AI-Powered Conversations**: The app uses OpenAI’s GPT-3 API to generate dynamic responses, simulating realistic chats with the chosen character.
- **Speech Processing**: Incorporates Google Cloud’s Speech-to-Text and Text-to-Speech APIs for voice input and audible responses.
- **Real-Time Communication**: Utilizes Rails' capabilities for instant messaging features, with future enhancements to include ActionCable (under progress) for WebSocket communication.
- **Responsive Front-End Design**: A user-friendly interface crafted with HTML, CSS, and JavaScript.

## Technical Workflow

1. **Character Selection**: Character selection updates the UI and triggers character-specific audio playback.
2. **Message Processing**: User inputs are processed through OpenAI's GPT-3 API, with the server fetching AI-generated responses.
3. **Audio Feedback**: Converts text responses to speech, providing an interactive auditory experience.

## Installation & Setup

Ensure you have Ruby and Rails installed on your system. Follow these steps to run the application locally:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. **Install Dependencies:**
   ```bash
   bundle install
   ```
   
3. **Run the Rails Server:**
   ```bash
   rails server
   ```

5. **Access the App:**
   Visit `http://localhost:3000` in your web browser.

## Future Enhancements

- **Character Database Expansion**: Enriching the array of available characters.
- **Automated Character Addition**: Leveraging web scraping for new character integration.
- **User Contributions**: Allowing users to add their custom characters.
- **Enhanced Testing & Error Handling**: Improving the robustness and user experience.
