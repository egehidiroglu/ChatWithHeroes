class CharacterChannel < ApplicationCable::Channel
  def subscribed
    stream_from "character_channel"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
