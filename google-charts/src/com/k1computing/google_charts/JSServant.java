package com.k1computing.google_charts;

import java.util.Arrays;
import org.json.JSONArray;

import android.webkit.JavascriptInterface;

public class JSServant {
	
@JavascriptInterface
public JSONArray getPerformance(){
	Object[] row1={"2004",  1000, 400};
	Object[] row2={"2005",  1170, 460};
	Object[] row3={"2006",  660,  1120};
	Object[] row4={"2007",  1030,  540};
	
	JSONArray aReturn=new JSONArray();
	aReturn.put(new JSONArray(Arrays.asList(row1)));
	aReturn.put(new JSONArray(Arrays.asList(row2)));
	aReturn.put(new JSONArray(Arrays.asList(row3)));
	aReturn.put(new JSONArray(Arrays.asList(row4)));
	return aReturn;
}

}
