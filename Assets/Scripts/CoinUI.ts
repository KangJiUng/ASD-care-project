import { TMP_Text } from 'TMPro';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import CoinManager from './CoinManager';

export default class CoinDisplay extends ZepetoScriptBehaviour {
    public coinText: TMP_Text; // ������ ǥ���� �ؽ�Ʈ �ʵ�

    Start() {
        // CoinManager�� ���� ���� �̺�Ʈ ����
        CoinManager.Instance.OnCoinsChanged = (newCoins: number) => {
            this.UpdateCoinText(newCoins);
        };

        // �ʱ� UI ������Ʈ
        this.UpdateCoinText(CoinManager.Instance.GetCoins());
    }

    private UpdateCoinText(newCoins: number) {
        if (this.coinText) {
            this.coinText.text = `${newCoins}`;
        } else {
            console.error("coinText field is not assigned in the Unity editor.");
        }
    }
}
