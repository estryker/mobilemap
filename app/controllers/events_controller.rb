class EventsController < ApplicationController
  # GET /events
  # GET /events.json
  def index

    # TODO: use better defaults? get these from other means?
    num_events = 10000
    center_lat = 0.0
    center_long = 0.0
    # 1 degree latitude = 110.574km at 0 degrees to  111.69km at 90 degrees
    # 1 degree longitude = 111.320 km at 0 degrees, 78.847 km at 45 degrees, 28.902 km at 75 degrees
    box_size = 2
    if params.has_key? :box_size
      z = params[:box_size].to_f
      if z > 0.0 and z <= 90
        box_size = z 
      end
    end

    all_events = []

    if(params.has_key?(:num_events) and params.has_key?(:center_latitude) and params.has_key?(:center_longitude))
      num_events = params[:num_events].to_i
      center_lat = params[:center_latitude].to_f
      center_long = params[:center_longitude].to_f
      
      # shift the numbers up to be between 0-180 and 0-360 so we can use modular arithmetic to
      # work at the edges. 
      lower_lat = ((center_lat + 90 - box_size) % 180) - 90
      upper_lat =  ((center_lat + 90 + box_size) %180) - 90
      lower_long = ((center_long + 180 - box_size) % 360) - 180
      upper_long = ((center_long + 180 + box_size) % 360) - 180
      # make a bounding box to make the query quicker. 5 degrees in all directions should do the trick

      where_statement = "latitude > ? AND latitude < ? AND longitude > ? AND longitude < ?"
      where_items = [lower_lat,upper_lat,lower_long,upper_long]

      # category_string = categories.map {|c| "category = '#{c}'"}.join(' OR ')
      # unless category_string.nil? or category_string.empty?
      #  where_statement += " AND (" + category_string + ")"
      # end
      where_clause = [where_statement] + where_items # no need for this: + sources + categories

      # puts where_clause
      all_events = Event.where(where_clause)
    else  
      # this will happen on the web client. I don't care about performance on it right now
      all_events = Event.all # Event.where(["created_at > ? AND time_utc <= ?",created_since, DateTime.now.utc]) 
    end
    
    # Inplace sorting was working up until the call to 'first' during debugging. I have no idea why. 
    sorted_events = all_events.sort do |a,b| 
      ((a.latitude - center_lat)**2 + (a.longitude - center_long)**2) <=> ((b.latitude - center_lat)**2 + (b.longitude - center_long)**2)
    end
 
    # trim by distance first, then sort by id
    # get rid of newlines in the description
    # debug: @events = sorted_events.first(num_events).each {|s| s.text.gsub!(/[\n\r]+/,' ')}    
    @events = sorted_events.first(num_events).sort {|a,b| a.id <=> b.id}.each {|s| s.text.gsub!(/[\n\r]+/,' ')}

    respond_to do |format|
      format.html { redirect_to root_path } # index.html.erb
      format.json { render json: @events }
    end
  end

  # GET /events/1
  # GET /events/1.json
  def show
    @event = Event.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @event }
    end
  end

  # GET /events/new
  # GET /events/new.json
  def new
    # TODO: make a page that will have code that sets the 
    # center of the page as the lat/long of the event

    @event = Event.new
    if params.has_key? :latitude
      @event.latitude = params[:latitude]
    end
    if params.has_key? :longitude
      @event.longitude = params[:longitude]
    end

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @event }
    end
  end

  # GET /events/1/edit
  def edit
    @event = Event.find(params[:id])
  end

  # POST /events
  # POST /events.json
  def create
    @event = Event.new(params[:event])

    respond_to do |format|
      if @event.save
        $stderr.puts "event save"
        $stderr.puts root_path
        # format.html { render 'map/root', notice: 'Event was successfully created.' }
        # format.html { redirect_to root_path} # , notice: 'Event was successfully created.' }
        format.html { redirect_to @event, notice: 'Event was successfully created.' }
        # format.html { redirect_to root_path }
        format.json { render json: @event, status: :created, location: @event }
      else
        format.html { render action: "new" }
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /events/1
  # PUT /events/1.json
  def update
    @event = Event.find(params[:id])

    respond_to do |format|
      if @event.update_attributes(params[:event])
        format.html { redirect_to @event, notice: 'Event was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /events/1
  # DELETE /events/1.json
  def destroy
    @event = Event.find(params[:id])
    @event.destroy

    respond_to do |format|
      format.html { redirect_to events_url }
      format.json { head :no_content }
    end
  end
end
