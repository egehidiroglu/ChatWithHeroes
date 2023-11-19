require 'httparty'

class OpenAIService
  include HTTParty
  base_uri 'https://api.openai.com/v1'

  def initialize
    @headers = {
      "Authorization" => "Bearer #{Rails.application.credentials.openai[:api_key]}",
      "Content-Type" => "application/json"
    }
  end

  def chat_with_openai(prompt)
    body = { prompt: prompt, max_tokens: 150 }.to_json
    self.class.post("/engines/davinci/completions", body: body, headers: @headers)
  end
end
