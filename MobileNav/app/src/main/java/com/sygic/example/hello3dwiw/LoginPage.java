package com.sygic.example.hello3dwiw;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import android.Manifest;
import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.telephony.TelephonyManager;
import android.view.View;

import android.content.Intent;
import android.content.res.Resources;
import android.os.Bundle;
import android.text.Editable;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.Toast;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.android.material.textfield.TextInputEditText;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;
import com.sygic.aura.ResourceManager;
import com.sygic.aura.utils.PermissionsUtils;

import org.jetbrains.annotations.NotNull;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class LoginPage extends AppCompatActivity implements AdapterView.OnItemSelectedListener {

    public static String mobileid;
    public static String mobileNumber;
    public static String carIdDoc;

    FirebaseFirestore db = FirebaseFirestore.getInstance();
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login_page);

        if (PermissionsUtils.requestStartupPermissions(this) == PackageManager.PERMISSION_GRANTED) {
            checkSygicResources();
        }

        if (ActivityCompat.checkSelfPermission(LoginPage.this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {

        } else {
            ActivityCompat.requestPermissions(LoginPage.this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 44);
        }

        SharedPreferences sh = getSharedPreferences("MySharedPref", MODE_PRIVATE);

        String s1 = sh.getString("phoneId", "");


        if (sh.contains("phoneId")){
            Log.d("TAGx", sh.contains("phoneId") + s1 + " som v ife a priradujem si " + s1 );
            mobileid = s1;
        }else{
            String uniqueID = UUID.randomUUID().toString();
        SharedPreferences.Editor myEdit = sh.edit();
        myEdit.putString("phoneId", uniqueID);
        mobileid = uniqueID;
            Log.d("TAGx", sh.contains("phoneId") + s1 + " som v else a priradujem si " + uniqueID );
        myEdit.commit();
        }


        Spinner spino = (Spinner) findViewById(R.id.static_spinner );

        spino.setVisibility(View.INVISIBLE);

        Button buttonToRoutes = (Button) findViewById(R.id.toRoutes);
        Button buttonLogout = (Button) findViewById(R.id.button2);

        buttonToRoutes.setVisibility(View.INVISIBLE);
        buttonLogout.setVisibility(View.INVISIBLE);


        Button button = (Button) findViewById(R.id.prihlas);
        button.setOnClickListener(new View.OnClickListener(){
            @Override
            //On click function
            public void onClick(View view) {
                //Create the intent to start another activity
                TextInputEditText textInputEditText = (TextInputEditText) findViewById(R.id.textInput);
                Editable cislo = textInputEditText.getText();
                mobileNumber = cislo.toString();
                Log.d("TAG", "cislo" + " => " + cislo);
                db.collection("cars")
                        .whereEqualTo("phoneNumber", cislo.toString())
                        .get()
                        .addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {
                            @Override
                            public void onComplete(@NonNull Task<QuerySnapshot> task) {
                                if (task.isSuccessful()) {
                                    if (task.getResult().size() > 0) {
                                        for (final QueryDocumentSnapshot document : task.getResult()) {
                                            Log.d("TAG", document.getId() + " => " + document.getData().get("phoneId"));
                                            carIdDoc = document.getId();

                                            if (document.getData().get("phoneId") == null || document.getData().get("phoneId").toString().equals(mobileid)) {


                                                Log.d("TAG", document.getId() + " => ");
                                                Intent intent = new Intent(LoginPage.this, ChooseRoute.class);
                                                intent.putExtra("carId", document.getId());

                                                Map<String, Object> data = new HashMap<>();
                                                data.put("status", 0);
                                                data.put("phoneId", mobileid);

                                                db.collection("cars").document(document.getId().toString())
                                                        .update(data);


                                                startActivity(intent);
                                            }else{
                                                AlertDialog.Builder builder = new AlertDialog.Builder(LoginPage.this);

                                                builder.setCancelable(true);
                                                builder.setTitle("Odhlásenie");
                                                builder.setMessage("Chcete odhlásiť predchádzajúci telefón z navigácie?" +
                                                        " Prihlásený môže byť len 1 používateľ. ");

                                                builder.setNegativeButton("Nie", new DialogInterface.OnClickListener() {
                                                    @Override
                                                    public void onClick(DialogInterface dialog, int which) {
                                                        dialog.cancel();
                                                    }
                                                });

                                                builder.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
                                                    @Override
                                                    public void onClick(DialogInterface dialog, int which) {
                                                        Log.d("TAG", document.getId() + " => ");
                                                        Intent intent = new Intent(LoginPage.this, ChooseRoute.class);
                                                        intent.putExtra("carId", document.getId());

                                                        Map<String, Object> data = new HashMap<>();
                                                        data.put("status", 0);
                                                        data.put("phoneId", mobileid);

                                                        db.collection("cars").document(document.getId().toString())
                                                                .update(data);


                                                        startActivity(intent);
                                                        dialog.cancel();
                                                    }
                                                });
                                                builder.show();
                                            }
                                        }
                                    }
                                    else{
                                        Log.d("TAG1", "neexist");
                                        Toast.makeText(getApplicationContext(),"Nesprávne číslo",Toast.LENGTH_SHORT).show();

                                    }
                                } else {
                                    Log.d("TAG", "Error getting documents: ", task.getException());
                                    Toast.makeText(getApplicationContext(),"Skúste to znova",Toast.LENGTH_SHORT).show();
                                }
                            }
                        });



            }
        });
    }


    @Override
    public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
        Resources res = getResources();
        String[] items = res.getStringArray(R.array.stateArray);
        Toast.makeText(this, "Array" + items[position], Toast.LENGTH_LONG).show();
        Log.e("Error", "" + items[position]);
    }

    @Override
    public void onNothingSelected(AdapterView<?> parent) {
        Resources res = getResources();
        String[] items = res.getStringArray(R.array.stateArray);
        Toast.makeText(this, "Assrray" , Toast.LENGTH_LONG).show();
        Log.e("Error", "" );
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        for(int res : grantResults) {
            if(res != PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "You have to allow all permissions", Toast.LENGTH_LONG).show();
                finish();
                return;
            }
        }
    }

    private void checkSygicResources() {
        ResourceManager resourceManager = new ResourceManager(this, null);
        if(resourceManager.shouldUpdateResources()) {
            Toast.makeText(this, "Please wait while Sygic resources are being updated", Toast.LENGTH_LONG).show();
            resourceManager.updateResources(new ResourceManager.OnResultListener() {
                @Override
                public void onError(int errorCode, @NotNull String message) {
                    finish();
                }

                @Override
                public void onSuccess() {

                }
            });
        }
        else {

        }
    }


}