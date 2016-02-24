#!/usr/bin/env ruby

require 'pathname'
require 'json'

all_json = []
json = Pathname.new('json')
json.children.select(&:directory?).each do |grade|
  subjects = grade.children.select(&:directory?).each do |subject|
    subject.children.reject {|c| c.basename.to_s == 'chapters.json'}.each do |chapter|
      puts "READING FILE: #{chapter}"
      contents = JSON.parse(chapter.read)
      apps = contents.select{|c| c['type'] == 'apps'}
      all_json.concat(apps)
    end
  end
end
all_json_file = Pathname.new('json/all.json');
all_json.uniq!{|f| f['id']}
JSON.dump(all_json, all_json_file)
