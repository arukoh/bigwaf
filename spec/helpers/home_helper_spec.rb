require 'rails_helper'

RSpec.describe HomeHelper, :type => :helper do

  describe "#croping_list" do
    it "return 3 objects" do
      expect(helper.croping_list.size).to eq 3
    end
  end

  describe "#effect_list" do
    it "return 7 objects" do
      expect(helper.effect_list.size).to eq 7
    end
  end

end
