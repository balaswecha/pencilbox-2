#!/usr/bin/env ruby
require 'fileutils'

def generate_tar(version)
  appWithVersion = "pencilbox-#{version}"
  Dir.mkdir(appWithVersion)
  Dir.chdir(appWithVersion) do
    generate_desktop()
    copy_icon()
    generate_lib()
  end
  tar_filename = "pencilbox_#{version}.orig.tar.gz"
  `tar czf #{tar_filename} #{appWithVersion}`
  FileUtils.rm_rf(appWithVersion)
  tar_filename
end

def extract_tar(filename)
  `tar xzf #{filename}`
end

def copy_icon()
  FileUtils.cp("../../pencilbox.png",".")
end

def generate_lib()
  Dir.mkdir("pencilbox")
  Dir.chdir("pencilbox") do
    FileUtils.cp_r("../../../../app",".")
    FileUtils.cp(["../../../../package.json","../../../../main.js"],".")
  end
  `electron-packager pencilbox pencilbox --platform=linux --arch=x64 --version=1.3.4`
  FileUtils.rm_rf("pencilbox")
  FileUtils.mv("pencilbox-linux-x64","lib")
end

def generate_meta_files()
  puts "Generating Deb files ..."
  Dir.mkdir('debian')
  Dir.chdir('debian') do
    generate_changelog()
    generate_control()
    generate_compat()
    generate_copyright()
    generate_rules()
    generate_install()
    generate_format()
    generate_postinst()
    generate_postrm()
  end
end

def generate_copyright()
  contents = <<-FILE.gsub(/^ {4}/, '')
    GPL V3
  FILE
  File.write('copyright', contents)
end

def generate_rules()
  contents = <<-FILE.gsub(/^ {4}/, '')
    #!/usr/bin/make -f
    %:
    	dh $@
    override_dh_usrlocal:
  FILE
  File.write("rules", contents)
end

def generate_format()
  Dir.mkdir('source')
  Dir.chdir('source') do
    contents = <<-FILE.gsub(/^ {6}/, '')
      3.0 (quilt)
    FILE
    File.write('format', contents)
  end
end

def generate_install()
  contents = <<-FILE.gsub(/^ {4}/, '')
    lib usr/lib/balaswecha/pencilbox
    pencilbox.desktop usr/share/applications
    pencilbox.png usr/share/icons
  FILE
  File.write("pencilbox.install", contents)
end

def generate_control()
  contents = <<-FILE.gsub(/^ {4}/, '')
    Source: pencilbox
    Maintainer: Balaswecha Team<balaswecha-dev-team@thoughtworks.com>
    Section: misc
    Priority: optional
    Standards-Version: 3.9.2
    Build-Depends: debhelper (>= 9)

    Package: pencilbox
    Architecture: amd64
    Depends: ${shlibs:Depends}, ${misc:Depends}
    Description: Launcher for BalaSwecha simulations
  FILE
  File.write('control', contents)
end

def generate_desktop()
  contents = <<-FILE.gsub(/^ {4}/, '')
    [Desktop Entry]
    Name=Pencilbox
    Comment=Launcher for Balaswecha Simulations
    Exec=pencilbox
    Icon=pencilbox
    Terminal=false
    Type=Application
    Categories=Simulations
  FILE

  File.write("pencilbox.desktop",contents)
end

def generate_postinst()
  contents = <<-FILE.gsub(/^ {4}/, '')
   #!/bin/sh
   if [ ! -f /usr/bin/pencilbox ]; then
     ln -s /usr/lib/balaswecha/pencilbox/lib/pencilbox /usr/bin/pencilbox
   fi
   exit 0
  FILE
  File.write("postinst", contents)
end

def generate_postrm()
  contents = <<-FILE.gsub(/^ {4}/, '')
    #!/bin/sh
    if [ -f /usr/bin/pencilbox ]; then
      rm /usr/bin/pencilbox
    fi
    exit 0
  FILE
  File.write("postrm", contents)
end


def generate_changelog()
  contents = <<-FILE.gsub(/^ {4}/, '')
    pencilbox (1.0-1) UNRELEASED; urgency=low

      * Initial release. (Closes: #XXXXX)

     -- Balaswecha Team <balaswecha-dev-team@thoughtworks.com>  #{Time.now.strftime '%a, %-d %b %Y %H:%M:%S %z'}
  FILE
  File.write('changelog', contents)
end

def generate_compat()
  File.write('compat', "9\n")
end

def generate_deb
  `debuild -i -us -uc -b`
  puts ".. Done!"
end

FileUtils.rm_rf 'dist'
Dir.mkdir('dist')
Dir.chdir('dist') do
      version = "1.0"
      tar_filename = generate_tar(version)
      extract_tar(tar_filename)
      Dir.chdir("pencilbox-#{version}") do
        generate_meta_files()
        generate_deb
      end
end
