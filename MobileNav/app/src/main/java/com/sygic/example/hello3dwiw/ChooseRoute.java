package com.sygic.example.hello3dwiw;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import android.animation.LayoutTransition;
import android.annotation.SuppressLint;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.os.Bundle;
import android.text.Editable;
import android.util.Log;
import android.util.TypedValue;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.android.material.textfield.TextInputEditText;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;

import org.jetbrains.annotations.NotNull;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

import static androidx.lifecycle.Lifecycle.State.STARTED;

public class ChooseRoute extends AppCompatActivity {
//ci aktivita bezi - len pre odhlasenie
    static boolean active = false;

    private String carId;
    private String mobileNumber;
    private String mobileId;
    FirebaseFirestore db = FirebaseFirestore.getInstance();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_choose_route);

        mobileNumber = LoginPage.mobileNumber;
        mobileId = LoginPage.mobileid;
//        checkOnlineMobile();

        final LinearLayout linearLayout = (LinearLayout) findViewById(R.id.carRoutes);

        Intent intent = getIntent();
        carId = intent.getExtras().getString("carId");

        //nacitavam vsetky aktivne trasy
        db.collection("route")
                .whereEqualTo("carId", carId).whereEqualTo("finished", false).orderBy("createdBy")
                .get()
                .addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {
                    @Override
                    public void onComplete(@NonNull Task<QuerySnapshot> task) {
                        if (task.isSuccessful()) {
                            int inexOfCollection = 1;

                            for (final QueryDocumentSnapshot document : task.getResult()) {
                                Log.d("pro", document.getId() + " => " + document.getData());
                                Object routeTowns = document.getData().get("nameOfTowns");
                                Object routeStatus = document.getData().get("status");
                                LinearLayout linearLayout1 = new LinearLayout(ChooseRoute.this);
                                linearLayout1.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
                                linearLayout1.setOrientation(LinearLayout.VERTICAL);
//                                linearLayout1.setBackgroundColor(Color.parseColor("#3fff38"));
                                final TextView headerText = new TextView(ChooseRoute.this);
                                headerText.setText("Cesta: " +  inexOfCollection);
                                headerText.setTextSize(TypedValue.COMPLEX_UNIT_SP,32f);
                                headerText.setBackgroundColor(Color.parseColor("#303F9F"));
                                headerText.setTextColor(Color.parseColor("#FFFFFF"));
                                linearLayout1.addView(headerText);
                                linearLayout1.setLayoutTransition(new LayoutTransition());
                                inexOfCollection++;
                                linearLayout1.setPadding(0,5,0,5);
                                linearLayout.addView(linearLayout1);
                                final TextView[] myTextViews = new TextView[((ArrayList<?>) routeTowns).size()];

                                for (int i = 0; i < ((ArrayList<?>) routeTowns).size(); i++) {
                                    // create a new textview
                                    final TextView rowTextView = new TextView(ChooseRoute.this);

                                    // set some properties of rowTextView or something
                                    rowTextView.setText((String)((ArrayList<?>) routeTowns).get(i));
                                    rowTextView.setTextSize(TypedValue.COMPLEX_UNIT_SP,30f);
//                                rowTextView.setBackground(getResources().getDrawable(R.drawable.border));
                                    rowTextView.setBackgroundResource(R.drawable.border);
                                    if (i +1 == ((ArrayList<?>) routeTowns).size()){
                                        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
                                        params.setMargins(0,0,0,10);
                                        rowTextView.setLayoutParams(params);
                                    }
                                    // add the textview to the linearlayout
                                    linearLayout1.addView(rowTextView);

                                    rowTextView.setId(i);
                                    rowTextView.setOnClickListener(new View.OnClickListener() {

                                        public void onClick(View v) {

                                            AlertDialog.Builder builder = new AlertDialog.Builder(ChooseRoute.this);

                                            builder.setCancelable(true);
                                            builder.setTitle("Navigácia");
                                            builder.setMessage("Chcete spustiť navigovanie s adresami v " + headerText.getText() + "?");

                                            builder.setNegativeButton("Nie", new DialogInterface.OnClickListener() {
                                                @Override
                                                public void onClick(DialogInterface dialog, int which) {
                                                    dialog.cancel();
                                                }
                                            });
                                            builder.setPositiveButton("Áno", new DialogInterface.OnClickListener() {
                                                @Override
                                                public void onClick(DialogInterface dialog, int which) {
                                                    Intent intent = new Intent(ChooseRoute.this, MainActivity.class);
                                                    intent.putExtra("carId", carId);
                                                    intent.putExtra("routeId", document.getId());
                                                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                                                    startActivity(intent);
//                                                    finish();
                                                }
                                            });
                                            builder.show();
                                        }
                                    });

                                    // save a reference to the textview for later
                                    myTextViews[i] = rowTextView;
                                }



                            }
                        } else {
                            Log.d("pro", "Error getting documents: ", task.getException());
                        }
                    }
                });



        Timer timer = new Timer();
        TimerTask doAsynch = new TimerTask() {
            @SuppressLint("MissingPermission")
            @Override
            public void run() {
                db.collection("route")
                        .whereEqualTo("carId", carId).whereEqualTo("finished", true).orderBy("finishedAt", Query.Direction.DESCENDING).limit(3)
                        .get()
                        .addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {
                            @Override
                            public void onComplete(@NonNull Task<QuerySnapshot> task) {
                                if (task.isSuccessful()) {
                                    int inexOfCollection = 1;

                                    for (final QueryDocumentSnapshot document : task.getResult()) {
                                        Log.d("pro", document.getId() + " => " + document.getData());
                                        Object routeTowns = document.getData().get("nameOfTowns");
                                        Object routeStatus = document.getData().get("status");
                                        LinearLayout linearLayout1 = new LinearLayout(ChooseRoute.this);
                                        linearLayout1.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
                                        linearLayout1.setOrientation(LinearLayout.VERTICAL);

                                        final TextView headerText = new TextView(ChooseRoute.this);
                                        headerText.setText("Posledne dokončená cesta: " +  inexOfCollection);
                                        headerText.setTextSize(TypedValue.COMPLEX_UNIT_SP,32f);
                                        headerText.setBackgroundColor(Color.parseColor("#00FF00"));
                                        headerText.setTextColor(Color.parseColor("#FFFFFF"));
                                        linearLayout1.addView(headerText);
                                        inexOfCollection++;
                                        linearLayout1.setPadding(0,5,0,5);
                                        linearLayout1.setLayoutTransition(new LayoutTransition());
                                        linearLayout.addView(linearLayout1);
                                        final TextView[] myTextViews = new TextView[((ArrayList<?>) routeTowns).size()];

                                        for (int i = 0; i < ((ArrayList<?>) routeTowns).size(); i++) {
                                            // create a new textview
                                            final TextView rowTextView = new TextView(ChooseRoute.this);

                                            // set some properties of rowTextView or something
                                            rowTextView.setText((String)((ArrayList<?>) routeTowns).get(i));
                                            rowTextView.setTextSize(TypedValue.COMPLEX_UNIT_SP,30f);
//                                rowTextView.setBackground(getResources().getDrawable(R.drawable.border));
                                            rowTextView.setBackgroundResource(R.drawable.border);
                                            if (i +1 == ((ArrayList<?>) routeTowns).size()){
                                                LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
                                                params.setMargins(0,0,0,10);
                                                rowTextView.setLayoutParams(params);
                                            }
                                            // add the textview to the linearlayout
                                            linearLayout1.addView(rowTextView);

                                            rowTextView.setId(i);
                                            rowTextView.setOnClickListener(new View.OnClickListener() {

                                                public void onClick(View v) {

                                                    AlertDialog.Builder builder = new AlertDialog.Builder(ChooseRoute.this);

                                                    builder.setCancelable(true);
                                                    builder.setTitle("Navigácia");
                                                    builder.setMessage("Chcete spustiť navigovanie s adresami v " + headerText.getText() + "?");

                                                    builder.setNegativeButton("Nie", new DialogInterface.OnClickListener() {
                                                        @Override
                                                        public void onClick(DialogInterface dialog, int which) {
                                                            dialog.cancel();
                                                        }
                                                    });
                                                    builder.setPositiveButton("Áno", new DialogInterface.OnClickListener() {
                                                        @Override
                                                        public void onClick(DialogInterface dialog, int which) {
                                                            Intent intent = new Intent(ChooseRoute.this, MainActivity.class);
                                                            intent.putExtra("carId", carId);
                                                            intent.putExtra("routeId", document.getId());
                                                            startActivity(intent);
                                                            finish();
                                                        }
                                                    });
                                                    builder.show();
                                                }
                                            });

                                            // save a reference to the textview for later
                                            myTextViews[i] = rowTextView;
                                        }



                                    }
                                } else {
                                    Log.d("pro", "Error getting documents: ", task.getException());
                                }
                            }
                        });

            }
        };
        timer.schedule(doAsynch, 500);


        Button buttonToRoutes = (Button) findViewById(R.id.toRoutes);
        Button buttonLogout = (Button) findViewById(R.id.button2);

        buttonToRoutes.setText("Navigacia");
        buttonToRoutes.setOnClickListener(new View.OnClickListener(){
            @Override
            //On click function
            public void onClick(View view) {
                Intent intent = new Intent(ChooseRoute.this, MainActivity.class);
                Log.d("pro", "Error getting documents: " + carId);

                intent.putExtra("carId", carId);
                intent.putExtra("routeId", "null");
                startActivity(intent);
                finish();

            }
        });
        buttonLogout.setOnClickListener(new View.OnClickListener(){
            @Override
            //On click function
            public void onClick(View view) {
                Intent intent = new Intent(ChooseRoute.this, LoginPage.class);
                Map<String, Object> data = new HashMap<>();
                data.put("status", -2);

                db.collection("cars").document(carId)
                        .update(data);
                carId = null;

                startActivity(intent);

            }
        });


    }

//    private void checkOnlineMobile(){
//
//       if (active){
//
//
//        db.collection("cars").document(LoginPage.carIdDoc)
//        .addSnapshotListener(new EventListener<DocumentSnapshot>() {
//            @Override
//            public void onEvent(@Nullable DocumentSnapshot snapshot,
//                                @Nullable FirebaseFirestoreException e) {
//                if (e != null) {
//                    Log.w("TAG", "Listen failed.", e);
//                    return;
//                }
//
//                String source = snapshot != null && snapshot.getMetadata().hasPendingWrites()
//                        ? "Local" : "Server";
//
//                if (snapshot != null && snapshot.exists()) {
//                    Log.d("TAG", source + " data: " + snapshot.getData());
//                    String fireIdMob = new String(snapshot.getData().get("phoneId").toString());
//                    if (!fireIdMob.equals(mobileId.toString())) {
//
//
//                        Log.d("TAGxx", snapshot.getData().get("phoneId").toString() + " => " + mobileId + " " + mobileNumber);
//
//                        AlertDialog.Builder builder = new AlertDialog.Builder(ChooseRoute.this);
//
//                        builder.setCancelable(false);
//                        builder.setTitle("Boli ste odlhaseny!!");
//                        builder.setMessage("Vasim telefonym cislom sa prihlasil iny pouzivatel");
//
//                        carId = null;
//                        mobileId = null;
//                        mobileNumber = null;
//
//                        builder.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
//                            @Override
//                            public void onClick(DialogInterface dialog, int which) {
//
//
//                                Intent intent = new Intent(ChooseRoute.this, LoginPage.class);
//                                startActivity(intent);
//                                finish();
//
//                            }
//                        });
//                        builder.show();
//
//                    }
//
//
//                } else {
//                    Log.d("TAG", source + " data: null");
//                }
//            }
//        });
//       }
//
//    }
//
//    @Override
//    public void onStart() {
//        super.onStart();
//        active = true;
//    }
//
//    @Override
//    public void onStop() {
//        super.onStop();
//        active = false;
//    }
//
//    @Override
//    protected void onResume() {
//        super.onResume();
//        active = true;
//    }
}