// Add in rotation

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


float sphereDF(vec3 pt, vec3 center, float radius) {
    float d = distance(pt, center) - radius;
    return d;
}



float smin( float a, float b, float k )
{
    float res = exp( -k*a ) + exp( -k*b );
    return -log( res )/k;
}

float rand(float n){
    return fract(sin(n) * 43758.5453123);
}


float sdTorus( vec3 pt, vec3 center, vec2 t )
{
  pt -= center;
  float PI = 3.14159;
  float theta = PI/2.0;
  float ct = cos(theta);
  float st = sin(theta);

  //center += vec3(0.01*sin(u_time/10.0),0.01*cos(u_time/10.0), 0.02);
   // center.x += u_time/10.0;
  pt *= mat3(1.0, 0., 0.,
            0., ct, -st,
            0., st, ct); 
  
  vec2 q = vec2(length(pt.xz)-t.x,pt.y);
  return length(q)-t.y;
}



float baseDistanceField(vec3 pt) {

    
    vec3 pt2 = pt + -0.1 *rand(2.0);
	vec3 pt3 = vec3(pt.x, pt.y - cos(u_time/10.), pt.z); 
    //pt += sin(rand(2.0)*u_time);
    
    float d1 = sdTorus(pt, vec3(0.1 +0.4*sin(u_time/10.), 0.1 - 0.8*cos(u_time/5.), 0.0), vec2(0.200,0.070));
    
    float d2 = sdTorus(pt2, vec3(0.2 +0.2*sin(u_time/7. +0.1*rand(u_time)), 0.2 +0.4*cos(u_time/10. + 0.1*rand(u_time)),0.0),vec2(0.200, 0.070));
    float d3 = sdTorus(pt3, vec3(-0.2 + 0.2*sin(u_time/17.), -0.2,0.0),vec2(0.200, 0.070));
    
    // float d1 = sphereDF(pt, vec3(0.2, 0.2, 0.0), 0.2);
    
    //float d2 = sphereDF(pt2, vec3(-0.2, -0.2,0.0),.10);
    //float d3 = sdTorus(pt3, vec3(-0.2, -0.2,0.0),vec2(0.200, 0.070));
   
    //float dSp = sphereDF(pt, vec3(vec2(0.030,-0.010),-5.752), 1.);
    //float dn = sphereDF(pt, vec3(2.*sin(u_time), 0., -5.8), 1.);
    //return min(d1, dn);
    //return d1;
    float dmin1 = min(d1,d2);
    return min(dmin1, d3);
    //return smin(d1,d2, 7.488);
}

float displacer(vec3 pt, float k) {
    return 0.2* sin(u_time) * sin(pt.x * k + u_time) *
         sin(pt.y * k) * sin(pt.z * k);
}

float distanceField(vec3 pt) {
    vec3 rotationOrigin = vec3(0.,0.,-6.);
    float theta = u_time / u_resolution.x * 4.;
    float st = sin(theta);
    float ct = cos(theta);
    /*pt = (pt - rotationOrigin) * mat3(-st, 0., ct,
                                     0., 1., 0.,
                                     ct, 0., st) + rotationOrigin;
	*/                         
    float d1 = baseDistanceField(pt);
    float d2 = displacer(pt*2.0, 10.);
    return d1+d2;
}



vec3 calculateNormal(in vec3 pt) {
    vec2 eps = vec2(1.0, -1.0) * 0.0005;
    return normalize(eps.xyy * distanceField(pt + eps.xyy) +
                     eps.yyx * distanceField(pt + eps.yyx) +
                     eps.yxy * distanceField(pt + eps.yxy) +
                     eps.xxx * distanceField(pt + eps.xxx));
}

void main() {
    vec2 normalizedCoordinates = gl_FragCoord.xy/u_resolution.xy; // ((0, 1) origin at bottom left)
    normalizedCoordinates -= vec2(0.5, 0.5); // centered, (-0.5, 0.5)
    normalizedCoordinates.x *= u_resolution.x/u_resolution.y;

    vec3 rayOrigin = vec3(0, 0, 1) ;
    //rayOrigin.x += u_time/1000.;

    vec3 rayDirection = normalize(vec3(normalizedCoordinates, 0.) - rayOrigin);

    // March the distance field until a surface is hit.
    float distance;
    float photonPosition = 1.; // Start out (approximately) at the image plane
    float stepSizeReduction = 0.8;
    for (int i = 0; i < 256; i++) {
        distance = distanceField(rayOrigin + rayDirection * photonPosition);
        photonPosition += distance * stepSizeReduction;
        if (distance < 0.01) 
            break;
    }
    
    if (distance < 0.01) {
        vec3 intersectionNormal = calculateNormal(rayOrigin + rayDirection * photonPosition);
        float x = intersectionNormal.x * 0.5 + 0.2;
        float y = intersectionNormal.y * -.5 + 0.0; 
        gl_FragColor = vec4(x,0.,0.0,1.000);
    } else {
    	gl_FragColor = vec4(0.134,0.305,0.293,0.100);// + normalizedCoordinates.x + normalizedCoordinates.y);
    }
}
