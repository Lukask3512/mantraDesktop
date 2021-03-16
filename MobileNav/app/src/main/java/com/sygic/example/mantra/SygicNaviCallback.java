package com.sygic.example.mantra;

import android.app.Activity;
import android.util.Log;

import com.sygic.aura.embedded.IApiCallback;
import com.sygic.sdk.api.events.ApiEvents;

public class SygicNaviCallback implements IApiCallback {

    private Activity mActivity;


    public SygicNaviCallback(Activity activity) {
        mActivity = activity;
    }

    @Override
    public void onEvent(final int event, final String data) {
        if(event == ApiEvents.EVENT_APP_EXIT) {
            mActivity.finish();
        }
        if (event == ApiEvents.EVENT_OFF_ROUTE_EXT || event == ApiEvents.EVENT_ROUTE_COMPUTED){
            Log.e("NavigationTime5", "co to bude" + MainActivity.readRouteId);
            MainActivity.sendRoute();
        }

        mActivity.runOnUiThread(
                new Runnable() {
                    @Override
                    public void run() {

                    }
                }
        );

    }

    @Override
    public void onServiceConnected() {
        Log.d(MainActivity.LOG_TAG, "service connected");
    }

    @Override
    public void onServiceDisconnected() {
        Log.d(MainActivity.LOG_TAG, "service disconnected");
    }
}
