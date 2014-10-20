/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

class GameApp extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     */
    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        this.createGameScene();
        return;
        //设置加载进度界面
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/resource.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    }

    /**
     * preload资源组加载进度
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private shape:egret.Shape;

    /**
     * 创建游戏场景
     */
    private createGameScene():void {
        var modeTxt:egret.TextField = new egret.TextField();
        modeTxt.textColor = 0xff0000;
        modeTxt.textAlign = egret.HorizontalAlign.CENTER;
        modeTxt.width = egret.MainContext.instance.stage.stageWidth;
        if (egret.MainContext.instance.rendererContext instanceof egret.WebGLRenderer) {
            modeTxt.text = "WebGLMode";
        }
        else {
            modeTxt.text = "CanvasMode";
        }
        this.stage.addChild(modeTxt);

        this.shape = new egret.Shape();
        this.addChild(this.shape);
        this.shape.width = 480;
        this.shape.height = 800;

        this.count = 0;

        this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
    }

    private count:number;

    private onEnterFrame(event:egret.Event):void {
        this.count += 0.1;
        var graphics = this.shape.graphics;
        graphics.clear();
        graphics.lineStyle(30, 0xff0000, 1);
        graphics.beginFill(0xffff00, 0.4);

        graphics.moveTo(100 + Math.sin(this.count) * 20, 200 + Math.cos(this.count) * 20);
        graphics.lineTo(360 + Math.cos(this.count) * 20, 200 + Math.sin(this.count) * 20);
        graphics.lineTo(360 + Math.sin(this.count) * 20, 420 + Math.cos(this.count) * 20);
        graphics.lineTo(100 + Math.cos(this.count) * 20, 420 + Math.sin(this.count) * 20);
        graphics.lineTo(100 + Math.sin(this.count) * 20, 200 + Math.cos(this.count) * 20);
        graphics.endFill();

        this.shape.cacheAsBitmap = true;
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     */
    private createBitmapByName(name:string):egret.Bitmap {
        var result:egret.Bitmap = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}


