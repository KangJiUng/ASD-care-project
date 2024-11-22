import { GameObject, Collider, TextAsset } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";
import { TMP_Text } from 'TMPro';

export default class BillboardUIManager extends ZepetoScriptBehaviour {
    public billboardCanvas: GameObject; // UI 오브젝트 (전광판 UI)
    public scrollViewText: TMP_Text; // ScrollView 내 텍스트 영역
    public jsonFile: TextAsset; // JSON 파일 (Unity Editor에서 연결)
    private _zepetoCharacter: ZepetoCharacter | null = null; // 캐릭터 참조
    private _isInCollider: boolean = false; // 캐릭터가 Collider 안에 있는지 확인

    Start() {
        // 로컬 플레이어 추가 시 캐릭터 참조 설정
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        });

        // 시작 시 UI 비활성화
        this.HideUI();
    }

    // Collider 안으로 들어왔을 때
    OnTriggerEnter(collider: Collider) {
        if (this._zepetoCharacter && collider.gameObject === this._zepetoCharacter.gameObject) {
            this._isInCollider = true;
            this.ShowUI();
            this.LoadJSONDataToScrollView(); // JSON 데이터 로드
        }
    }

    // Collider에서 나갔을 때
    OnTriggerExit(collider: Collider) {
        if (this._zepetoCharacter && collider.gameObject === this._zepetoCharacter.gameObject) {
            this._isInCollider = false;
            this.HideUI();
        }
    }

    // UI 활성화 메서드
    private ShowUI() {
        if (!this._isInCollider) return;
        this.billboardCanvas.SetActive(true);
    }

    // UI 비활성화 메서드
    private HideUI() {
        this.billboardCanvas.SetActive(false);
    }

    // JSON 데이터 로드 및 ScrollView 텍스트 업데이트
    private LoadJSONDataToScrollView() {
        if (!this.jsonFile) {
            console.error("JSON 파일이 연결되지 않았습니다.");
            return;
        }

        // JSON 파일 파싱
        const jsonData = JSON.parse(this.jsonFile.text);

        // JSON 데이터의 text 내용을 ScrollView 텍스트로 변환
        let formattedText = "";
        if (jsonData.feedbacks && Array.isArray(jsonData.feedbacks)) {
            jsonData.feedbacks.forEach((feedback: { text: string }) => {
                formattedText += feedback.text + "\n"; // JSON의 text 필드 추가
            });
        } else {
            console.error("JSON 데이터 형식이 올바르지 않습니다.");
        }

        // ScrollView의 텍스트 업데이트
        this.scrollViewText.text = formattedText;
    }
}