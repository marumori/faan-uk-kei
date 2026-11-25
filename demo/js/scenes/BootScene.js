// BootScene：用程式產生角色貼圖，之後進入 HomeScene。
import { makeHeroTexture } from '../world/art.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create() {
    makeHeroTexture(this);
    this.scene.start('HomeScene');
  }
}
