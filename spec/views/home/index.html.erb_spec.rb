require 'rails_helper'

RSpec.describe "home/index.html.erb", :type => :view do

  def asset_selector(path, count = 1)
    opts ={}
    opts[:count] = count
    expect(rendered).to have_selector(path, opts)
  end

  before do
    render
  end
  
  it "displays page caption" do
    asset_selector(%Q{#page-caption})
    asset_selector(%Q{#page-caption h2}) 
  end

  it "displays dropzone" do
    asset_selector(%Q{.row>div[class="col-sm-8 clearfix"]})
    asset_selector(%Q{.row>.col-sm-8})
    asset_selector(%Q{.col-sm-8>.bs-component})
    asset_selector(%Q{.col-sm-8>.bs-component>#droparea})
    asset_selector(%Q{#droparea>.dropareainner})
    asset_selector(%Q{#droparea>.dropareainner>div}, 2)
    asset_selector(%Q{#droparea>.dropareainner>div[id="err"]})
    asset_selector(%Q{.col-sm-8>.bs-component>#select})
    asset_selector(%Q{#select[type="file"][multiple]})
    asset_selector(%Q{.col-sm-8>.bs-component>#image-size-wrap})
    asset_selector(%Q{#image-size-wrap[class="pull-right"]})
    asset_selector(%Q{#image-size-wrap>label})
    asset_selector(%Q{#image-size-wrap>label>input})
    asset_selector(%Q{#image-size-wrap>label>input[type="number"][name="image-size"][min="16"]})
  end

  it "displays selector" do
    asset_selector(%Q{.row>.col-sm-2}, 2)
    asset_selector(%Q{.row>.col-sm-2[id="selector-left"]})
    asset_selector(%Q{.row>.col-sm-2[id="selector-right"]})
  end

  it "displays selector for croping" do
    asset_selector(%Q{#selector-left>.bs-component})
    asset_selector(%Q{#selector-left>.bs-component>div})
    asset_selector(%Q{#selector-left>.bs-component>div[class="btn-group btn-group-vertical center-block"]})
    asset_selector(%Q{#selector-left>.bs-component>div>label}, croping_list.size)
    croping_list.each do |croping|
      asset_selector(%Q{#selector-left label[class="btn btn-default"]>##{croping}})
    end
  end

  it "displays selector for effect" do
    asset_selector(%Q{#selector-right>.bs-component})
    asset_selector(%Q{#selector-right>.bs-component>div})
    asset_selector(%Q{#selector-right>.bs-component>div[class="btn-group btn-group-vertical center-block"]})
    asset_selector(%Q{#selector-right>.bs-component>div>label}, effect_list.size)
    effect_list.each do |effect|
      asset_selector(%Q{#selector-right label[class="btn btn-default"]>##{effect}})
    end
  end

  it "displays space for preview" do
    asset_selector(%Q{#result})
  end

end
