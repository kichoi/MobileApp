package com.k1computing.google_charts;

import java.util.Locale;
import com.k1computing.google_charts.R;
import android.app.Activity;
import android.content.Intent;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;


public class SettingActivity extends Activity implements View.OnClickListener {
	private Spinner mSpinner;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		Locale aLocale=null;
		try{
			aLocale=getBaseContext().getResources().getConfiguration().locale;
		} catch (NullPointerException e){			
		}
		int index=0;
		if(aLocale.equals(Locale.ENGLISH)){
			index=0;
		} else if (aLocale.equals(Locale.CHINESE)) {
			index=1;			
		} else if (aLocale.equals(Locale.SIMPLIFIED_CHINESE)) {
			index=2;			
		} 
		setContentView(R.layout.activity_setting);
		Spinner langSpinner=(Spinner)findViewById(R.id.langs_spinner);
		mSpinner=langSpinner;
		String[] items=getResources().getStringArray(R.array.languages);
		ArrayAdapter<String> adapter = new ArrayAdapter<String>(this,android.R.layout.simple_spinner_item, items);              
		// adapter.setDropDownViewResource(android.R.layout.simple_spinner_item);
		langSpinner.setAdapter(adapter);
		langSpinner.setSelection(index);
		Button confirmBtn=(Button)findViewById(R.id.setting_confirm_btn);
		Button cancelBtn=(Button)findViewById(R.id.setting_cancel_btn);
		confirmBtn.setOnClickListener(this);
		cancelBtn.setOnClickListener(this);
	}
	
	
	protected void doFinish(){
		this.finish();
	}

	@Override
	public void onClick(View v) {
		int id=v.getId();
		if(id == R.id.setting_cancel_btn){
			this.finish();
		} else if (id==R.id.setting_confirm_btn){
			Locale selectedLocale=null;
			Spinner spinner=mSpinner;
			int lang=spinner.getSelectedItemPosition();
			switch (lang){
			case 0:
				selectedLocale=Locale.ENGLISH;
				break;
			case 1:
				selectedLocale=Locale.CHINESE;
				break;
			case 2:
				selectedLocale=Locale.SIMPLIFIED_CHINESE;	
				break;
			default:
				selectedLocale=Locale.ENGLISH;
			}
			Configuration aConfig=new Configuration();
			aConfig.locale=selectedLocale;
			Resources res=this.getResources();
			DisplayMetrics dm=res.getDisplayMetrics();
			getBaseContext().getResources().updateConfiguration(aConfig, dm);
			Intent intent = getBaseContext().getPackageManager().getLaunchIntentForPackage(getBaseContext().getPackageName() );
			intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
			startActivity(intent);
		}
	}

}
