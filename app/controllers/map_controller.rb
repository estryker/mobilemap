class MapController < ApplicationController

  def root
    # I want to render the map at the user's location
    # BUT the view is obtaining the user's location asynchronously ...
    # 


    # Perhaps have the javascript itself do a REST call to this server
    # on the callback? like to an index function?

    # How to add the markers.  Build a list here, and send it to the erb view,
    # and write a loop in the erb to set it in the javascript. 
  end

  def about
    
  end
end
