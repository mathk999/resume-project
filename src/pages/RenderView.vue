<template>
  <div>
    <canvas ref="renderer"></canvas>
  </div>
</template>
<script>
import * as THREE from 'three';
import { sonarShader } from './sketches/shaders';

export default {
  name: 'RenderView',

  methods: {
    
  },

  mounted() {
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    var clock = new THREE.Clock();

    var renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.$refs.renderer });
    renderer.setSize( window.innerWidth, window.innerHeight );

    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: { x: 0.0, y: 0.0 } },
      u_mouse_pos: { value: { x: 0.0, y: 0.0 } },
      u_color: { value: new THREE.Color(0x0000FF) },
    }

    var geometry = new THREE.PlaneGeometry(2, 2);
    var material = new THREE.ShaderMaterial({
      ...sonarShader, uniforms
    });
    var plane = new THREE.Mesh( geometry, material );
    scene.add( plane );

    camera.position.z = 1;

    const animate = () => {
      requestAnimationFrame( animate );
      renderer.render( scene, camera );

      uniforms.u_time.value = clock.getElapsedTime();
    };

    const onMove = (evt) => {
      uniforms.u_mouse_pos.value.x = evt.touches ? evt.touches[0].clientX : evt.clientX;
      uniforms.u_mouse_pos.value.y = evt.touches ? evt.touches[0].clientY : evt.clientY;
    }
      
    const onWindowResize = () => {
      const aspectRatio = window.innerWidth/window.innerHeight;
      let width, height;

      if (aspectRatio>=1) {
        width = 1;
        height = (window.innerHeight/window.innerWidth) * width;
      } else {
        width = aspectRatio;
        height = 1;
      }

      camera.left = -width;
      camera.right = width;
      camera.top = height;
      camera.bottom = -height;

      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

      uniforms.u_resolution.value.x = window.innerWidth;
      uniforms.u_resolution.value.y = window.innerHeight;
    }

    animate();
    onWindowResize();

    if ('ontouchstart' in window) {
      window.addEventListener('touchmove', onMove);
    } else {
      window.addEventListener('mousemove', onMove)
      window.addEventListener('resize', onWindowResize, false);
    }
  }
}
</script>