using UnityEditor;

[InitializeOnLoad]
public class ZepetoWindowActivator
{
    static ZepetoWindowActivator()
    {
        // 에디터의 포커스 변경 이벤트에 콜백 함수 등록
        EditorApplication.focusChanged += OnFocusChanged;
    }

    private static void OnFocusChanged(bool hasFocus)
    {
        if (hasFocus)
        {
            // ZEPETO 윈도우 열기
            EditorApplication.ExecuteMenuItem("ZEPETO/Build It Asset Browser");
            EditorApplication.ExecuteMenuItem("ZEPETO/Zepeto Scene Settings");
        }
    }

}