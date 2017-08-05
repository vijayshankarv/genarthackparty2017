// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 ptRep( vec3 pt)
{
 	vec3 c = vec3(sin(1000. + 0.3*u_time/300.), 0.0,0.);
    vec3 c1 = vec3(0.166, cos(u_time/10.),0.0);
    vec3 q = mod(pt, c)-0.5*c1;
    return q;
}

vec3 ptRot(vec3 pt, mat3 m )
{
    vec3 q = m*pt;
    return q;
}

float sphereDF(vec3 pt, vec3 center, float radius){
	float x = 0.1;
    float y = 0.3;
    float z = 0.0;
    float d = distance(mod(pt,vec3(x,y,z)), center) - radius;
    return d;
}

float smin( float a, float b, float k )
{
	float k1 = abs(sin(k*u_time/500.));
    float res = exp( -k*a ) + exp( -k1*b );
    return -log( res )/k;
}


float baseDistanceField(vec3 pt) {
    vec3 pt1 = ptRep(pt);
    float theta = u_mouse.x/u_resolution.x*1.0;
    
    float d1 = sphereDF(pt1, vec3(vec2(0.010, 0.02* cos(theta) + 0.05),-1.),0.05); 
    // sphere at (-1,0,5) with radius 1
    float d2 = sphereDF(pt, vec3(2.*sin(u_time), 0., -2.8), 0.1);
    return smin(d1,d2, 10.488);
}

float displacer(vec3 pt, float k) {
    return 0.1 * sin(u_time) * sin(pt.x * k + u_time) * sin(pt.y * k) * sin(pt.z * k);
}

float distanceField(vec3 pt) {
    //vec3 rotationOrigin = vec3(0.,0.,-6.);
    //float theta = u_mouse.x / u_resolution.x * 4.;
    //float st = sin(theta);
    //float ct = cos(theta);
    /*
    pt = (pt - rotationOrigin) * mat3(-st, 0., ct,
                                     0., 1., 0.,
                                     ct, 0., st) + rotationOrigin;
    */
    pt.y = mod(pt.y+u_time/10.,5.); 
    float d1 = baseDistanceField(pt);
    float d2 = displacer(ptRep(pt), 8.416);
    return d1+ d2;
}


vec3 calculateNormal(vec3 pt){
    vec2 eps = vec2(1.0, -1.0)*0.0005;
        return normalize(eps.xyy * distanceField(pt + eps.xyy) +
                     eps.yyx * distanceField(pt + eps.yyx) +
                     eps.yxy * distanceField(pt + eps.yxy) +
                     eps.xxx * distanceField(pt + eps.xxx));
/*
    return normalize(eps.xyy * distanceField(pt + eps.xyy) +
                     eps.yyx * distanceField(pt + eps.yyx) +
                     eps.yxy + distanceField(pt + eps.yxy) +
                     eps.xxx + distanceField(pt + eps.xxx));
                     */
}

void main() {
    
	 vec2 st = gl_FragCoord.xy/u_resolution.xy;
    
    // Shift center of the screen to (0.,0.)
    st -= vec2(0.5, 0.5);
    // Make aspect ratio square
    st.x *= u_resolution.x/u_resolution.y;
    
    // Origin from where ray is fired
    vec3 rayOrigin = vec3(0.,0.,1.);
    // Direction of the ray to the pixel
    vec3 rayDirection = normalize(vec3(st,0.) - rayOrigin);
    
    
    float distance;
    // Initial position of photon
    float photonPosition = 1.0;
    float thres = 0.01;
    //float thres = abs(sin(u_time*2.0));
    
    for (int i =0; i<256; i++){
        
        //Threshold 
        
        // Get the distance from the photon in that direction
        distance = distanceField(rayOrigin + rayDirection * photonPosition);
        // Update photon position by taking a step
        photonPosition += distance;
        
        if (distance < thres){
            break;
        }
    }
        if (distance < thres){
            
            vec3 intersectionNormal = calculateNormal(rayOrigin + 
                                                      rayDirection * photonPosition);
            float red = intersectionNormal.x * 0.5 + 0.1; //ranges from 0 to 1
            float green = intersectionNormal.y * 0.3 + 0.2 ; 
            gl_FragColor = vec4(red,green,red,1.000);
            
        }
        else {
            gl_FragColor = vec4(-0.018,0.2,0.2,0.2);
        }
    
}