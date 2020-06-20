
import DropBox from "./DropBox";
import Bullet from "./Bullet";
import GameUI from "./GameUI";
/**
 * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */
export default class GameControl extends Laya.Script {
    /** @prop {name:dropBox,tips:"掉落容器预制体对象",type:Prefab}*/
    dropBox: Laya.Prefab;
    /** @prop {name:bullet,tips:"子弹预制体对象",type:Prefab}*/
    bullet: Laya.Prefab;
    /** @prop {name:createBoxInterval,tips:"间隔多少毫秒创建一个下跌的容器",type:int,default:1000}*/
    createBoxInterval: number = 1000;
    /**开始时间*/
    private _time: number = 0;
    /**是否已经开始游戏 */
    private _started: boolean = false;
    /**子弹和盒子所在的容器对象 */
    private _gameBox: Laya.Sprite;
    gameUI: GameUI


    onEnable(): void {
        this._time = Date.now();
        this._gameBox = this.owner.getChildByName("gameBox") as Laya.Sprite;
    }

    physicsWorldX = 0
    onUpdate(): void {
        //让小车一直在最前面
        if (this.gameUI) {
            let cardx = this.gameUI.car.x
            let xx = 640 - cardx
            let dif = xx - this.physicsWorldX
            if (dif) {
                this.physicsWorldX = xx
                for (let one of this.PhyObj) {
                    one.x += xx
                }
                //不知道是laya bug 还是 box  是可以改  改了  就没有物理系统了...
                // Laya.Physics.I.world.ShiftOrigin({ x: -dif / Laya.Physics.PIXEL_RATIO, y: 0 })
            }
        }

    }
    PhyObj: Laya.Sprite[] = []
    setGameUI(ui: GameUI) {
        this.gameUI = ui
        this.PhyObj.push(this.gameUI.car)
        this.PhyObj.push(this.gameUI.wheel1)
        this.PhyObj.push(this.gameUI.wheel2)
        this.PhyObj.push(this.gameUI.line)
    }
    /**开始游戏，通过激活本脚本方式开始游戏*/
    startGame(): void {
        if (!this._started) {
            this._started = true;
            this.enabled = true;
        }
    }
    /**结束游戏，通过非激活本脚本停止游戏 */
    stopGame(): void {
        this._started = false;
        this.enabled = false;
        this.createBoxInterval = 1000;
        this._gameBox.removeChildren();
    }
}