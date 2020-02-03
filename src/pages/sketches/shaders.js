const rectFunc = `
  float rect(vec2 pt, vec2 anchor, vec2 size, vec2 center) {
    vec2 dist = pt - center;
    vec2 half_size = size * 0.5;

    float horizontal_edge = step(-half_size.x - anchor.x, dist.x) - step(half_size.x - anchor.x, dist.x);
    float vertical_edge = step(-half_size.y - anchor.y, dist.y) - step(half_size.y - anchor.y, dist.y);

    return horizontal_edge * vertical_edge;
  }
`

const circFunc = `
  float circ(vec2 pt, vec2 center, float radius) {
    vec2 dist = pt - center;
    float vec_len = length(dist.xy);

    return 1.0 - step(radius, vec_len);
  }
`

const circSmoothFunc = `
  float circSmooth(vec2 pt, vec2 center, float radius, float edge) {
    vec2 dist = pt - center;
    float smooth_edge = radius * edge;
    float vec_len = length(dist);

    return 1.0 - smoothstep(radius-smooth_edge, radius+smooth_edge, vec_len);
  }
`

const circLineFunc = `
  float circLine(vec2 pt, vec2 center, float radius, float width) {
    vec2 dist = pt - center;
    float half_w = width / 2.0;
    float vec_len = length(dist);

    return step(radius-half_w, vec_len) - step(radius+half_w, vec_len);
  }
`

const lineFunc = `
  float line(float a, float b, float width, float smooth) {
    float f_half_w = a - width / 2.0;
    float s_half_w = a + width / 2.0;

    return smoothstep(f_half_w-smooth, f_half_w, b) - smoothstep(s_half_w-smooth, s_half_w, b);
  }
`

const rotationMatrixFunc = `
  mat2 rotationMatrix(float theta) {
    float s = sin(theta);
    float c = cos(theta);

    return mat2(c, -s, s, c);
  }
`

const scaleMatrixFunc = `
  mat2 scaleMatrix(float scale) {
    return mat2(scale, 0, 0, scale);
  }
`

export const colorAndShapeShader = {
  vertexShader: `
    varying vec2 v_uv;
    varying vec3 v_position;

    void main() {
      v_uv = uv;
      v_position = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.7, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec3 u_color;
    uniform vec2 u_mouse_pos;
    uniform vec2 u_resolution;
    uniform float u_time;

    varying vec2 v_uv;
    varying vec3 v_position;

    ${rectFunc}

    void main() {
      vec2 v_pos_res = u_mouse_pos/u_resolution;
      vec2 uv_pos = gl_FragCoord.xy/u_resolution;

      vec3 mouse_color = vec3(v_pos_res.x, 0.0, v_pos_res.y);
      vec3 time_color = vec3((sin(u_time)+1.0)/2.0, 0.0, (cos(u_time)+1.0)/2.0);
      vec3 mix_color = mix(time_color, mouse_color, uv_pos.y);
      vec3 uv_color = vec3(v_uv.x, v_uv.y, 0.0);
      
      float vec_len = length(v_position.xy);
      float in_Circle = 1.0 - step(0.5, vec_len);

      float fst_in_Rect = rect(v_position.xy, vec2(0.3), vec2(-0.85, 0.0));
      float snd_in_Rect = rect(v_position.xy, vec2(0.4), vec2(0.8, 0.0));

      vec3 fst_color = vec3(1.0, 1.0, 0.0);
      vec3 snd_color = vec3(0.0, 1.0, 0.0);

      vec3 fun_color = fst_color * fst_in_Rect + snd_color * snd_in_Rect;

      gl_FragColor = vec4(fun_color, 1.0);
    }
  `
}

export const moveShapeShader = {
  vertexShader: `
    varying vec3 v_position;
    varying vec2 v_uv;

    void main() {
      v_position = position;
      v_uv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.7, 1.0);
    }
  `,

  fragmentShader: `
    uniform float u_time;

    varying vec3 v_position;
    varying vec2 v_uv;

    ${rectFunc}
    ${rotationMatrixFunc}
    ${scaleMatrixFunc}

    void main() {
      vec2 center = vec2(0.5);

      float tile_count = 20.0;
      vec2 fract_pos = fract(v_uv * tile_count);

      mat2 rotation_mat = rotationMatrix(u_time);
      mat2 scale_mat = scaleMatrix((sin(u_time) + 1.0)/3.0 + 0.5);

      vec2 point = ((fract_pos - center) * scale_mat * rotation_mat) + center;
      float in_Rect = rect(point, vec2(-0.15, 0.15), vec2(0.3), center);

      vec3 color = vec3(1.0, 1.0, 0.0);
      vec3 rect_color = color * in_Rect;

      gl_FragColor = vec4(rect_color, 1.0);
    }
  `
}

export const advShapeShader = {
  vertexShader: `
    varying vec3 v_position;
    varying vec2 v_uv;

    void main() {
      v_position = position;
      v_uv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.7, 1.0);
    }
  `,

  fragmentShader: `
    varying vec3 v_position;
    varying vec2 v_uv;

    ${circFunc}
    ${circSmoothFunc}
    ${circLineFunc}
    ${lineFunc}

    void main() {
      vec3 color = vec3(1.0, 0.0, 0.0);
      vec2 uv = gl_FragCoord.xy;

      float circle = circ(v_position.xy, vec2(0.5, -0.5), 0.3);
      float smooth_circel = circSmooth(v_position.xy, vec2(-0.5), 0.3, 0.1);
      float line_circle = circLine(v_position.xy, vec2(0.5), 0.3, 0.01);

      float sin_x = (sin(v_position.x * 3.1415) + 1.0) / 2.0;
      float line_s = line(v_position.y, mix(-0.9, 0.9, sin_x), 0.01, 0.001);

      vec3 circ1 = (color * circle);
      vec3 circ2 = (color * line_circle);
      vec3 circ3 = (color * smooth_circel);
      vec3 line1 = (color * line_s);

      vec3 final_color = circ1 + circ2 + circ3 + line1;

      gl_FragColor = vec4(final_color, 1.0);
    }
  `
}

export const sonarShader = {
  vertexShader: `
    varying vec2 v_uv;
    
    void main() {
      v_uv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.9, 1.0);
    }
  `,

  fragmentShader: `
    ${lineFunc}
    ${circLineFunc}

    varying vec2 v_uv;

    void main() {
      vec3 axis_color = vec3(0.7);
      vec3 shape_color = axis_color * line(v_uv.y, 0.5, 0.002, 0.001);
      shape_color += axis_color * line(0.5, v_uv.x, 0.002, 0.001);
      shape_color += axis_color * circLine(v_uv, vec2(0.5), 0.3, 0.002);
      shape_color += axis_color * circLine(v_uv, vec2(0.5), 0.2, 0.002);
      shape_color += axis_color * circLine(v_uv, vec2(0.5), 0.1, 0.002);

      gl_FragColor = vec4(shape_color, 1.0);
    }
  `
}
