#!/usr/bin/env ruby

key_file = './key.rb'
require key_file

$current_date = `date -I`
$current_date = $current_date.chomp
def create_package()

   `curl -v -u#{$key} -H "Content-Type: application/json" -X POST https://api.bintray.com/packages/balaswecha/balaswecha-dev --data '{ \"name\": \"pencilbox\", \"licenses\": [ \"GPL-3.0\" ], \"website_url\":\"https://github.com/balaswecha/pencilbox-2\", \"vcs_url\":\"https://github.com/balaswecha/pencilbox-2\" }'` 
end

def create_version()

   `curl -v -u#{$key} -H "Content-Type: application/json" -X POST https://api.bintray.com/packages/balaswecha/balaswecha-dev/pencilbox/versions --data '{ \"name\": \"1.0-1\", \"release_notes\": \"auto\",\"released\": \"#{$current_date}\" }'`

end

def upload_package()

`curl -v -u#{$key} -H "X-Bintray-Debian-Distribution: trusty,xenial,jessie,stretch" -H "X-Bintray-Debian-Component: main" -H "X-Bintray-Debian-Architecture: amd64" -H "publish:1" -X PUT -T pencilbox_1.0-1_amd64.deb https://api.bintray.com/content/balaswecha/balaswecha-dev/pencilbox/1.0-1/pool/main/pencilbox/pencilbox/pencilbox_1.0-1_amd64.deb`

end

def publish_package()

  `curl -X POST -u#{$key} https://api.bintray.com/content/balaswecha/balaswecha-dev/pencilbox/1.0-1/publish`

end

Dir.chdir('dist') do
  create_package()
  create_version()
  upload_package()
  publish_package()
  puts "Successfully uploaded Pencilbox"
end
