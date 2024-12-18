import { GameObject, Collider } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";
import { TMP_Text } from 'TMPro';
import { PlayerPrefs } from 'UnityEngine';

export default class BillboardUIManager extends ZepetoScriptBehaviour {
    public billboardCanvas: GameObject; // UI 오브젝트 (전광판 UI)
    public scrollViewText: TMP_Text; // ScrollView 내 텍스트 영역
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
            this.LoadFeedbackData(); // PlayerPrefs 데이터 로드 및 표시
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

    // PlayerPrefs 데이터를 기반으로 ScrollView 텍스트 업데이트
    private LoadFeedbackData() {
        // PlayerPrefs에서 저장된 데이터 불러오기
        const savedData = PlayerPrefs.GetString("DialogueResults", "[]");
        const results = JSON.parse(savedData);

        // 데이터가 없을 경우 처리
        if (!results || results.length === 0) {
            console.warn("저장된 결과 데이터가 없습니다.");
            this.scrollViewText.text = "No feedback available.";
            return;
        }

        // 피드백 텍스트 생성
        let feedbackText = "• Simulation Feedback\n";

        results.forEach((result: { dialogueId: number; attempts: number; correctAnswer: string }, index: number) => {
            // 정답 여부 및 시도 횟수에 따라 텍스트 생성
            const dialogueText = `${result.correctAnswer}`;
            if (result.attempts <= 4) {
                feedbackText += `${index + 1}. ${dialogueText} ••• The right choice in ${result.attempts}/4 times\n`;
            } else {
                feedbackText += `${index + 1}. ${dialogueText} ••• Failure to make the right choice\n`;
            }
        });

        // ScrollView의 텍스트 업데이트
        this.scrollViewText.text = feedbackText;

        // 디버깅 로그
        console.log("Updated Feedback Text:\n", feedbackText);
    }
}
