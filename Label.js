// kudos: http://japhr.blogspot.com.es/2013/03/fun-with-threejs-camera-orientation.html

var THREE,raycaster,container

module.exports = function (three, LabelPlugin, container) {

THREE = three // hack until three.js fixes multiple instantiation
raycaster = new THREE.Raycaster() // test for obstacle occlusion
container = container || document.body

function Label(object, playerId, content, verticalOffset, duration) {
  this.object = object;
  this.content = content;
  this.playerId = playerId;
  this.vertOffset = verticalOffset || 0
  if (duration) this.remove(duration);

  this.el = this.buildElement(container);
  LabelPlugin.add(this);
}

Label.prototype.buildElement = function(container) {
  var el = document.createElement('div');
  el.innerHTML = this.content;
  el.style.position = 'absolute';
  container.appendChild(el);
  return el;
}

// is a label visible from the camera
// returns a number between 0 (invisible) 
// and 1 (visible). What should be partially 
// visible depends on personal preference. 
Label.prototype.objectVisibility = function(object,vertOffset,cam,scene){
  ////////////////////////////////////////
  // Is the point in front of the camera?
  ////////////////////////////////////////
  // credit: http://stackoverflow.com/questions/14023764/how-to-get-orientation-of-camera-in-three-js
  // the camera's location (in world coordinates)
  var cam0 = cam.position.clone().applyMatrix4(cam.matrixWorld)
  // a pt 1 unit directly ahead of the camera (in world coordinates)
  var cam1 = new THREE.Vector3(0, 0, -1).applyMatrix4(cam.matrixWorld)
  // world coordinate vector in the direction of the camera
  var camdir = cam1.sub(cam0)
  // world coordinate vector from cam to obj
  var labelpos = object.position.clone().setY(object.position.y+vertOffset)
  var objdir = labelpos.sub(cam0)
  // angle between the camera and obj
  var angle = camdir.angleTo(objdir)
  if (angle>Math.PI/2){
    return 0
  }

  ////////////////////////////////////////
  // Is there an obstacle occluding the label?
  ////////////////////////////////////////
  var collisions,dist
  //raycaster.set(cam0,camdir) // origin,direction
  raycaster.set(cam0,objdir) // origin,direction
  // ignore collisions that happen with the 
  // source or destination labeled object or after
  raycaster.near = 1
  raycaster.far = cam0.distanceTo(object.position) - 1
  collisions = raycaster.intersectObjects(scene.__objects)
  if (collisions.length>0){
    return 0.25;
  }

  // entirely visible
  return 1;
}

Label.prototype.render = function(scene, cam) {
  var p3d = this.object.position.clone();
  p3d.z = p3d.z + 0 * Math.sin(cam.rotation.x);
  p3d.y = p3d.y + this.vertOffset;//0 * Math.cos(cam.rotation.x) * Math.cos(cam.rotation.z);

  p3d.x = p3d.x - 0 * Math.sin(cam.rotation.z) * Math.sin(cam.rotation.y);

  // get projection (x and y coordinates according to 2d camera)
  var projector = new THREE.Projector(),
      pos = projector.projectVector(p3d, cam),
      width = container.offsetWidth,
      height = container.offsetHeight,
      w = this.el.offsetWidth,
      h = this.el.offsetHeight;

  this.el.style.top = '' + (height/2 - height/2 * pos.y - h - 10) + 'px';
  this.el.style.left = '' + (width/2 * pos.x + width/2 - w/2) + 'px';
  // label visibility 
  this.el.style.opacity = '' + this.objectVisibility(this.object.avatar,this.vertOffset,cam,scene);
};

Label.prototype.setContent = function(content) {
  this.content = content;
  this.el.innerHTML = this.content;
};

Label.prototype.remove = function(delay) {
  var that = this;
  if (delay) return setTimeout(function(){that.remove();}, delay * 1000);
  this.el.style.display = 'none';
  return LabelPlugin.remove(this);
};

Label.prototype.update = function(content) {
  var that = this;
  if (content) this.content = content
//    return setTimeout(function(){that.remove();}, delay * 1000);
//  this.el.style.display = 'none';
  return LabelPlugin.update(this);
};

  return Label;

}
