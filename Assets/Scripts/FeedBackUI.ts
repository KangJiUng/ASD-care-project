import { GameObject, Collider, TextAsset } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";
import { TMP_Text } from 'TMPro';

export default class BillboardUIManager extends ZepetoScriptBehaviour {
    public billboardCanvas: GameObject; // UI ������Ʈ (������ UI)
    public scrollViewText: TMP_Text; // ScrollView �� �ؽ�Ʈ ����
    public jsonFile: TextAsset; // JSON ���� (Unity Editor���� ����)
    private _zepetoCharacter: ZepetoCharacter | null = null; // ĳ���� ����
    private _isInCollider: boolean = false; // ĳ���Ͱ� Collider �ȿ� �ִ��� Ȯ��

    Start() {
        // ���� �÷��̾� �߰� �� ĳ���� ���� ����
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        });

        // ���� �� UI ��Ȱ��ȭ
        this.HideUI();
    }

    // Collider ������ ������ ��
    OnTriggerEnter(collider: Collider) {
        if (this._zepetoCharacter && collider.gameObject === this._zepetoCharacter.gameObject) {
            this._isInCollider = true;
            this.ShowUI();
            this.LoadJSONDataToScrollView(); // JSON ������ �ε�
        }
    }

    // Collider���� ������ ��
    OnTriggerExit(collider: Collider) {
        if (this._zepetoCharacter && collider.gameObject === this._zepetoCharacter.gameObject) {
            this._isInCollider = false;
            this.HideUI();
        }
    }

    // UI Ȱ��ȭ �޼���
    private ShowUI() {
        if (!this._isInCollider) return;
        this.billboardCanvas.SetActive(true);
    }

    // UI ��Ȱ��ȭ �޼���
    private HideUI() {
        this.billboardCanvas.SetActive(false);
    }

    // JSON ������ �ε� �� ScrollView �ؽ�Ʈ ������Ʈ
    private LoadJSONDataToScrollView() {
        if (!this.jsonFile) {
            console.error("JSON ������ ������� �ʾҽ��ϴ�.");
            return;
        }

        // JSON ���� �Ľ�
        const jsonData = JSON.parse(this.jsonFile.text);

        // JSON �������� text ������ ScrollView �ؽ�Ʈ�� ��ȯ
        let formattedText = "";
        if (jsonData.feedbacks && Array.isArray(jsonData.feedbacks)) {
            jsonData.feedbacks.forEach((feedback: { text: string }) => {
                formattedText += feedback.text + "\n"; // JSON�� text �ʵ� �߰�
            });
        } else {
            console.error("JSON ������ ������ �ùٸ��� �ʽ��ϴ�.");
        }

        // ScrollView�� �ؽ�Ʈ ������Ʈ
        this.scrollViewText.text = formattedText;
    }
}