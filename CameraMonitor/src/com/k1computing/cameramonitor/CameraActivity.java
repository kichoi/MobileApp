package com.k1computing.cameramonitor;

import java.io.IOException;
import java.net.URI;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHttpResponse;
import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Context;
import android.hardware.Camera;
import android.os.Bundle;
import android.os.Handler;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.Window;

public class CameraActivity extends Activity {
	private Preview mPreview;
	private Camera mCamera;

	// Test GIT
	
	class Preview extends SurfaceView implements SurfaceHolder.Callback {
		SurfaceHolder mHolder;

		Preview(Context context) {
			super(context);
			mHolder = getHolder();
			mHolder.addCallback(this);
			mHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
		}

		public void surfaceCreated(SurfaceHolder holder) {
			try {
				mCamera.setPreviewDisplay(holder);
				takePicture();
			} catch (IOException exception) {
				mCamera.release();
				mCamera = null;
			}
		}

		public void surfaceDestroyed(SurfaceHolder holder) {
			mCamera.stopPreview();
			mCamera.release();
			mCamera = null;
		}

		public void surfaceChanged(SurfaceHolder holder, int format, int w, int h) {
			Camera.Parameters parameters = mCamera.getParameters();
			parameters.setPreviewSize(w, h);
			mCamera.setParameters(parameters);
			mCamera.startPreview();
		}
	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		mCamera=Camera.open();
		mCamera.getParameters().setFlashMode(Camera.Parameters.FLASH_MODE_TORCH);
		mPreview = new Preview(this);
		setContentView(mPreview);
	}
	

	private void takePicture(){
		Camera.PictureCallback jpegCallback; 
		final Context ctx=this;
		jpegCallback=new Camera.PictureCallback() {			
			
			public void onPictureTaken(byte[] data, Camera camera) {
				System.out.println("data length="+data.length);
				System.out.println("data="+data);
				final ProgressDialog aDialog=ProgressDialog.show(ctx,"Camera action","starting...");
				final Handler aHandler=new Handler();
				new Thread(new Runnable(){
					public void run(){
//						String url="http://10.0.2.2:8080/iCampServ/storebytes";
//						HttpClient httpClient=new DefaultHttpClient();
//						HttpPost httppost = new HttpPost(URI.create(url));
//						ByteArrayEntity be;
//						be = new ByteArrayEntity(data);
//						httppost.setEntity(be);
//						BasicHttpResponse httpResponse;
//						try {
//							httpResponse = (BasicHttpResponse) httpClient.execute(httppost);
//							System.out.println("status="+httpResponse.getStatusLine());
//						} catch (ClientProtocolException e) {
//							e.printStackTrace();
//						} catch (IOException e) {
//							e.printStackTrace();
//						} finally {
//							httpClient.getConnectionManager().closeExpiredConnections();
//						}

						aDialog.dismiss();
						System.out.println("Take pic and send to server ... done");				
						aHandler.post(new Runnable(){
							public void run(){
								finishActivity();
							}
						});
					}
				}).start();
			}
		};
		mCamera.takePicture(null, null, jpegCallback);
		
	}
	
	protected void finishActivity(){
		System.out.println("CameraAcivity finished");
		mPreview.invalidate();
		this.finish();
	}
}
