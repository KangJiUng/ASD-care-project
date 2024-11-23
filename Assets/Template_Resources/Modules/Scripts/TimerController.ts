import { Coroutine, GameObject, Mathf, Object, Time, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoPlayers, ZepetoCharacter } from "ZEPETO.Character.Controller";
import InteractionIcon from '../Interaction/ZepetoScript/InteractionIcon';
import { RawImage, Text } from 'UnityEngine.UI';

export default class TimerController extends ZepetoScriptBehaviour {

    public timerUI: GameObject;

    private _interactionIcon_start: InteractionIcon;
    private _interactionIcon_end: InteractionIcon;
    private _isStart: bool = false;
    private _coTimer: Coroutine;
    private _currentTimerUI: GameObject;
    private _timerText: Text;
    private _elapsedTime: number = 0;
    private _success: GameObject;

    private Start() {

        this.SetInteractionIcons();

        this._interactionIcon_start.OnClickEvent.AddListener(() => {
            this.StartTimer();
        });

        this._interactionIcon_end.OnClickEvent.AddListener(() => {
            this.EndTimer();
        });
    }

    private SetInteractionIcons() {
        const interactionIcons = this.GetComponentsInChildren<InteractionIcon>();
        interactionIcons.forEach(e => {
            if (e.name == "InteractionPoint_Start") {
                this._interactionIcon_start = e;
            } else if (e.name == "InteractionPoint_End") {
                this._interactionIcon_end = e;
            }
        });
    }

    private StartTimer() {        
        this._interactionIcon_start.HideIcon();
        this._isStart = true;
        this.CheckUICanvas();
        this._success.SetActive(false);
        this._coTimer = this.StartCoroutine(this.CoTimer());
    }

    private EndTimer() {
        if (!this._isStart) {
            return;
        }
        this._interactionIcon_end.HideIcon();
        this._isStart = false;        
        this.StopCoroutine(this._coTimer);
        this.StartCoroutine(this.CoSuccess());
    }

    private *CoSuccess(){
        this._success.SetActive(true);
        yield new WaitForSeconds(1);
        this._success.SetActive(false);
        this._currentTimerUI.SetActive(false);
    }

    private *CoTimer() {
        while (true) {
            this._elapsedTime += Time.deltaTime;
            this.FormatTime(this._elapsedTime);
            yield null;
        }
    }

    private CheckUICanvas() {
        if (this._currentTimerUI == null) {
            this._currentTimerUI = GameObject.Instantiate(this.timerUI) as GameObject;
            this._timerText = this._currentTimerUI.GetComponentInChildren<Text>();
            this._success = this._currentTimerUI.GetComponentInChildren<RawImage>().gameObject;
        }
        this._currentTimerUI.SetActive(true);
    }

    private FormatTime(time: number) {
        const minutes = Mathf.FloorToInt(time / 60);
        const seconds = Mathf.FloorToInt(time % 60);

        const minuteString = minutes < 10 ? "0" + minutes.toString() : minutes.toString();
        const secondString = seconds < 10 ? "0" + seconds.toString() : seconds.toString();

        this._timerText.text = minuteString + " : " + secondString;        
    }


}