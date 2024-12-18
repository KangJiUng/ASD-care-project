import { TMP_Text } from 'TMPro';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import CoinManager from './CoinManager';

export default class CoinDisplay extends ZepetoScriptBehaviour {
    public coinText: TMP_Text; // 코인을 표시할 텍스트 필드

    Start() {
        // CoinManager의 코인 변경 이벤트 구독
        CoinManager.Instance.OnCoinsChanged = (newCoins: number) => {
            this.UpdateCoinText(newCoins);
        };

        // 초기 UI 업데이트
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
