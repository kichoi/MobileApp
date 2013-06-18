package com.k1computing.cameramonitor;


import android.app.Activity;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

public class MainActivity extends Activity {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        long t=System.currentTimeMillis();
        long interval=60*1000;
        registerAlarmTrigger(t,interval);
    }
    
    
    
    protected void registerAlarmTrigger(long triggerAtTime, long interval){
    	AlarmManager am=(AlarmManager) getSystemService(Context.ALARM_SERVICE);
    	Intent anIntent=new Intent(this,CameraActivity.class);
    	PendingIntent operation=PendingIntent.getActivity(this,0,anIntent,PendingIntent.FLAG_UPDATE_CURRENT);
    	am.setRepeating(AlarmManager.RTC_WAKEUP, triggerAtTime, interval, operation);
    }
    

}