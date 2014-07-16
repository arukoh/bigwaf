class HomeController < ApplicationController
  def index
    flash.now[:alert] = "Under Development"
  end
end
