#!/usr/bin/env ruby

#Takes a single argument grade

require 'pathname'
require 'json'

grade_json = {}
json = Pathname.new('json/'+ARGV[0])
subs = JSON.parse(Pathname.new('json/'+ARGV[0]+'/subjects.json').read)
grade_json["grade"] = ARGV[0]
grade_json["subjects"] = subs
grade_json["subjects"].each do |subject|
    chapters = JSON.parse(Pathname.new('json/'+ARGV[0]+'/'+subject["slug"]+'/chapters.json').read)
    chapters.each do |chapter|
        if File.file?('json/'+ARGV[0]+'/'+subject["slug"]+'/' + chapter["slug"] + '.json')
            chapJSON = JSON.parse(Pathname.new('json/'+ARGV[0]+'/'+subject["slug"]+'/' + chapter["slug"] + '.json').read)
            chapter["contents"] = chapJSON
        end
    end
    subject["chapters"] = chapters
end
grade_json_file = Pathname.new('json/'+ARGV[0]+'.json')
JSON.dump(grade_json, grade_json_file)