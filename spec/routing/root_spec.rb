require 'rails_helper'

RSpec.describe "routing", :type => :routing do

  it "routes / to Home#index" do
    expect(get: "/").to route_to(controller: "home", action: "index")
  end

end
