Vagrant.configure(2) do |config|
  	config.vm.box = "ubuntu/trusty64"

	config.vm.provision "shell", privileged:false, inline: <<-SHELL
    	sudo apt-get update
        sudo apt-get install -y mongodb-server openssh-server
	 	curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
		export NVM_DIR="/home/vagrant/.nvm"
		[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
		nvm install 4.2.1
		mkdir -p ludwig
	    cd ludwig
		npm i sgmap.ludwig --prefix /home/vagrant/ludwig/
	SHELL
end
