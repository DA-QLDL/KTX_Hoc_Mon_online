package vn.ktxhocmon.app;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;

public class MainActivity extends Activity {
    private static final String HOME="https://ktx-hoc-mon-online.vercel.app/";
    private WebView web;
    private ValueCallback<Uri[]> pendingFiles;
    private static final int PICK_FILES=541;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web=new WebView(this); setContentView(web);
        WebSettings settings=web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        CookieManager.getInstance().setAcceptCookie(true);
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u=req.getUrl();
                if ("https".equals(u.getScheme()) && "ktx-hoc-mon-online.vercel.app".equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW,u)); } catch (Exception ignored) {}
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> cb,FileChooserParams params){
                if(pendingFiles!=null)pendingFiles.onReceiveValue(null);
                pendingFiles=cb;
                try { startActivityForResult(params.createIntent(),PICK_FILES); return true; }
                catch(Exception ex){pendingFiles=null;cb.onReceiveValue(null);return false;}
            }
        });
        web.setDownloadListener((url,userAgent,disposition,mimeType,size)->{
            try { startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url))); }
            catch(Exception ignored) {}
        });
        web.loadUrl(HOME);
    }
    @Override protected void onActivityResult(int code,int result,Intent data){
        super.onActivityResult(code,result,data);
        if(code==PICK_FILES && pendingFiles!=null){
            pendingFiles.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data));pendingFiles=null;
        }
    }
    @Override public void onBackPressed(){
        if(web!=null&&web.canGoBack())web.goBack(); else super.onBackPressed();
    }
    @Override protected void onDestroy(){ if(web!=null)web.destroy();super.onDestroy();}
}
