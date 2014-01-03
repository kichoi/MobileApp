package com.k1computing.google_charts;

import android.os.Bundle;
import android.app.Activity;
import android.app.FragmentManager;
import android.content.Intent;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebViewFragment;

public class MainActivity extends Activity {
	static private final String LOG_TAG="GC_Main";
	
	static public class ChartFragment extends WebViewFragment {

		@Override
		public void onActivityCreated(Bundle savedInstanceState) {
			super.onActivityCreated(savedInstanceState);
			Log.d(LOG_TAG, this.toString()+".onActivityCreated()");	
			WebView chartView = getWebView();
			chartView.getSettings().setJavaScriptEnabled(true);
			chartView.addJavascriptInterface(new JSServant(), "Android");
			chartView.setWebViewClient(new WebViewClient());
			chartView.setWebChromeClient(new WebChromeClient());  
			chartView.loadUrl("file:///android_res/raw/staticchart.html");		
		}

		@Override
		public void onResume() {
			super.onResume();
			Log.d(LOG_TAG, this.toString()+".onResume()");
		}			
		
	}
	

	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		Log.d(LOG_TAG, this.toString()+".onCreate()");		
		setContentView(R.layout.frame_main);
		WebViewFragment aFragment=new ChartFragment();
		FragmentManager aFragmentMgr=getFragmentManager();
		aFragmentMgr.beginTransaction().add(R.id.content_frame, aFragment).commit();
	}

	
	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.main, menu);
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
	    super.onOptionsItemSelected(item);
	    this.closeOptionsMenu();
	    Intent intent = new Intent(this, SettingActivity.class);
	    startActivity(intent);
	    return true;
	}


	@Override
	protected void onRestart() {
		super.onRestart();
		Log.d(LOG_TAG, this.toString()+".onRestart()");		
	}


	@Override
	protected void onResume() {
		super.onResume();
		Log.d(LOG_TAG, this.toString()+".onResume()");		
	}

}
