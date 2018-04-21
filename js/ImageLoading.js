var playerImage = document.createElement("img");
var playerSelection = document.createElement("img");
var buildingSelection = document.createElement("img");
var tileSheet = document.createElement("img");

var picsToLoad = 0;

function countLoadedImageAndLaunchIfReady() {
  picsToLoad--;
  if(picsToLoad == 0) { // last image loaded?
    loadingDoneSoStartGame();
  }
}

function beginLoadingImage(imgVar, fileName) {
  imgVar.onload=countLoadedImageAndLaunchIfReady;
  imgVar.src="images/"+fileName;
}

function loadImages() {

  var imageList = [
    {varName:tileSheet, theFile:"sprite_strip.png"},
    {varName:playerImage, theFile:"player.png"},
    {varName:playerSelection, theFile:"player_selection.png"},
    {varName:buildingSelection, theFile:"building_selection.png"}
    ];

  picsToLoad = imageList.length;
  for(var i=0;i<imageList.length;i++) {
    beginLoadingImage(imageList[i].varName, imageList[i].theFile);
  } // end of for imageList

} // end of function loadImages
