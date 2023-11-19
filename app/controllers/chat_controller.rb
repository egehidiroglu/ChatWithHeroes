require 'google/cloud/speech'

class ChatController < ApplicationController
  def index
  end

  def create
    message = params[:message]
    character = params[:character] || 'Anakin Skywalker'
    text_response = chat_with_openai(message, character)

    # if character.present?
    #   ActionCable.server.broadcast 'character_channel', character: character
    #   Rails.logger.info "Broadcasting character: #{character}"
    # end

    if text_response.blank?
      render json: { error: 'Empty or invalid response from OpenAI' }, status: :bad_request
    else
      speech_content = convert_text_to_speech(text_response)
      send_data speech_content, type: 'audio/mpeg', disposition: 'inline'
    end
  end  

  def convert_text_to_speech(text)
    credentials_path = ENV['GOOGLE_CLOUD_CREDENTIALS_JSON']

    if credentials_path.nil?
      raise "Google Cloud credentials path not set in environment"
    end

    client = Google::Cloud::TextToSpeech.text_to_speech do |config|
      config.credentials = credentials_path
    end

    if text.blank?
      raise "Text input for Text-to-Speech is empty"
    end

    input_text = { text: text }
    voice = { language_code: "en-US", ssml_gender: "NEUTRAL" }
    audio_config = { audio_encoding: "MP3" }

    response = client.synthesize_speech(
      input: input_text,
      voice: voice,
      audio_config: audio_config
    )

    response.audio_content
  end

  def speech_to_text
    Rails.logger.info "Received params: #{params.inspect}"

    audio_file = params[:audio]

    if audio_file.nil?
      render json: { error: "No audio provided" }, status: :bad_request
      return
    end

    audio_content = params[:audio].read

    speech = Google::Cloud::Speech.speech
    config = { language_code: "en-US" }
    audio  = { content: audio_content }

    begin
      response = speech.recognize config: config, audio: audio
      transcript = response.results.map(&:alternatives).flatten.map(&:transcript).join("\n")
      render json: { transcript: transcript }
    rescue => e
      render json: { error: e.message }, status: :internal_server_error
    end
  end

  def chat_with_openai(prompt, character)
    headers = {
      "Authorization" => "Bearer #{Rails.application.credentials.openai[:api_key]}",
      "Content-Type" => "application/json"
    }

    character_instructions = character_instructions_for(character)

    answer_instructions = " Respond in one sentence."

    formatted_prompt = character_instructions + answer_instructions + prompt + "?"
  
    body = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: character_instructions
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.2
    }.to_json

    Rails.logger.info "Sending to OpenAI: #{body}"
  
    response = HTTParty.post(
      "https://api.openai.com/v1/chat/completions",
      body: body,
      headers: headers
    )
  
    Rails.logger.info "OpenAI Request Body: #{body}"
    Rails.logger.info "OpenAI Response: #{response.body}"
  
    if response.success?
      # Extract the assistant's response text from the OpenAI response
      assistant_message = response.parsed_response['choices'].first['message']['content']
      Rails.logger.info "Assistant's Response: #{assistant_message}"
      assistant_message
    else
      Rails.logger.error "OpenAI Error: #{response.body}"
      nil
    end
  end

  def character_instructions_for(character)
    case character
    when 'Anakin Skywalker'
      "You are Anakin Skywalker. I want you to act like Anakin Skywalker from Star Wars."
    when 'Optimus Prime'
      "You are Optimus Prime. I want you to act like Optimus Prime from Transformers."
    when 'Batman'
      "You are Batman. I want you to act like Batman from DC Comics."
    else
      "You are Anakin Skywalker. I want you to act like Anakin Skywalker from Star Wars."
    end
  end
end
