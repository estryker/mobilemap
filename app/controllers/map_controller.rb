class MapController < ApplicationController

  def root
    # nothing to do.  simply render the root.html.erb file, and it
    # will callback via javascript to get the markers
    @event = Event.new
  end

  def about
    
  end
end
