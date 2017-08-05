// Title: Cellular Noise

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float rand(float f)
{
    //highp float a = 12.9898;
    //highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt = f;
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

vec2 random2(vec2 p) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),
                          dot(p,vec2(269.5,183.3))))*43758.5453);
}

float sphereDF(vec3 pt, vec3 center, float radius) {
    float d = distance(pt, center) - radius;
    return d;
}

float baseDistance(vec3 pt){
     float d1 = sphereDF(pt, vec3(0.2, 0.2, 0.0), 0.080);
     return d1;
    
}

float cellular(vec2 p) {
    vec2 i_st = floor(p);
    vec2 f_st = fract(p);
    vec2 mo = u_mouse/u_resolution; 
    float m_dist = 1.;
    for (int j=-1; j<=1; j++ ) {
        for (int i=-1; i<=1; i++ ) {
            vec2 neighbor = vec2(float(i),float(j));
            vec2 point = random2(i_st + neighbor) + 0.01*rand(u_time/30.) 
                + 0.3*sin(u_time + 0.1 * rand(u_time/100.));  
                + vec2(mo.x*u_time/100.0, mo.y*u_time/200.000);
            point = 0.5 + 0.5*sin(6.2831*point);
            vec2 diff = neighbor + point - f_st;
            
           // float dist = baseDistance(pt);
            float dist = length(diff);
        	m_dist = min(m_dist, dist);
        }
    }
        return m_dist;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    st -= vec2(0.5, 0.5); // centered, (-0.5, 0.5)
    st.x *= u_resolution.x / u_resolution.y;
    st *= 20.*clamp(u_mouse.x/u_resolution.x, 0.4, 1.0);
    
    float v = cellular(st);
    vec3 color1 = vec3(v);
    gl_FragColor = vec4(color1,1.0);
}
