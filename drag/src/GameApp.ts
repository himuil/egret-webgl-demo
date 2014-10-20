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

    private currentBall:egret.Bitmap;
    private localX:number;
    private localY:number;
    private ballList:Array<egret.Bitmap>;

    /**
     * 创建游戏场景
     */
    private createGameScene():void {
        egret.Profiler.getInstance().run();

        this.ballList = [];
        var stage:egret.Stage = egret.MainContext.instance.stage;
        for (var i:number = 0; i < 15; i++) {
            var ball:egret.Bitmap = this.createBitmapByName("ball");
            ball.x = Math.floor(Math.random() * (stage.stageWidth - 80));
            ball.y = Math.floor(Math.random() * (stage.stageHeight - 80));
            ball.scaleX = ball.scaleY = 0.5;
            this.addChild(ball);
            this.ballList.push(ball);
        }
        stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
        stage.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
        stage.addEventListener(egret.Event.LEAVE_STAGE, this.onTouchEnd, this);

        var txt:egret.TextField = new egret.TextField();
        txt.width = stage.stageWidth;
        txt.textAlign = egret.HorizontalAlign.CENTER;
        txt.text = "Drag!";
        txt.textColor = 0xff0000;
        txt.y = 300;
        this.addChild(txt);

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
        this.addChild(modeTxt);
    }

    private onTouchBegin(event:egret.TouchEvent):void {
        for (var i:number = this.ballList.length - 1; i >= 0; i--) {
            var ball:egret.Bitmap = this.ballList[i];
            if (ball.hitTestPoint(event.stageX, event.stageY, true)) {
                this.currentBall = ball;
                var p:egret.Point = this.currentBall.globalToLocal(event.stageX, event.stageY);
                this.localX = p.x * this.currentBall.scaleX;
                this.localY = p.y * this.currentBall.scaleY;
                return;
            }
        }
    }

    private onTouchMove(event:egret.TouchEvent):void {
        if (this.currentBall) {
            this.currentBall.x = event.stageX - this.localX;
            this.currentBall.y = event.stageY - this.localY;
        }
    }

    private onTouchEnd(event:egret.TouchEvent):void {
        this.currentBall = null;
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


