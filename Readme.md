# On Ubuntu Precise

#Prolog
sudo apt-get install python-software-properties
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs npm

#Project dependencies
sudo aptitude install libicu-dev libcairo2-dev
npm install xmpp-client winston canvas node-stringprep


cp config_example config
vi config #edit to your needs
